/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Crea (o actualiza la contraseña de) un usuario ADMIN directamente en la base
 * de datos. Pensado para ejecutarse en el servidor de producción (HelioHost),
 * donde no siempre está disponible `ts-node` (devDependency) ni una terminal
 * SSH. Solo usa `@prisma/client` y `bcrypt`, que son dependencias de
 * producción normales.
 *
 * Cómo usarlo SIN SSH (paneles que solo permiten ejecutar "npm run <script>"
 * sin flags ni variables de entorno propias):
 *   1. Edita (o crea) el archivo `backend/.env` con el editor de archivos del
 *      panel y añade estas líneas (junto a las que ya tenga, como DATABASE_URL):
 *        ADMIN_USERNAME=admin
 *        ADMIN_PASSWORD=TuContraseñaSegura123!
 *   2. Ejecuta el script `npm run create-admin` desde el panel.
 *   3. Por seguridad, borra esas dos líneas de `.env` una vez creado el admin.
 *
 * Si tienes terminal, también puedes pasar los datos por flags o variables:
 *   node scripts/create-admin.js --username admin --password "ContraseñaSegura123!"
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=xxx node scripts/create-admin.js
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Carga manual de `.env` (sin depender de que el proceso que lanza el script
// herede las variables de entorno de la app; algunos paneles de hosting no
// las propagan al ejecutar "npm run" fuera del proceso de Passenger).
function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const contenido = fs.readFileSync(envPath, 'utf8');
  for (const linea of contenido.split('\n')) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const clave = l.slice(0, idx).trim();
    let valor = l.slice(idx + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    // No pisar variables ya definidas por el entorno real del proceso.
    if (process.env[clave] === undefined) {
      process.env[clave] = valor;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username') result.username = args[++i];
    else if (args[i] === '--password') result.password = args[++i];
  }
  return result;
}

async function main() {
  loadDotEnv();

  const { username: argUsername, password: argPassword } = parseArgs();
  const username = argUsername ?? process.env.ADMIN_USERNAME;
  const password = argPassword ?? process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      'Faltan datos. Define ADMIN_USERNAME y ADMIN_PASSWORD en backend/.env,\n' +
        'o pásalos como variables de entorno, o con flags:\n' +
        '  node scripts/create-admin.js --username <usuario> --password <contraseña>',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error(
      'DATABASE_URL no está definida. Añádela en backend/.env o en las variables ' +
        'de entorno de la app.',
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const existente = await prisma.user.findUnique({ where: { username } });

    if (existente) {
      await prisma.user.update({
        where: { username },
        data: { passwordHash, role: 'ADMIN', isActive: true },
      });
      console.log(`✅ Usuario "${username}" actualizado a ADMIN y contraseña reestablecida.`);
    } else {
      await prisma.user.create({
        data: { username, passwordHash, role: 'ADMIN' },
      });
      console.log(`✅ Usuario ADMIN "${username}" creado.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Error creando el usuario admin:', err);
  process.exit(1);
});
