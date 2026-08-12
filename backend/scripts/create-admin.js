/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Crea (o actualiza la contraseña de) un usuario ADMIN directamente en la base
 * de datos. Pensado para ejecutarse en el servidor de producción (HelioHost),
 * donde no siempre está disponible `ts-node` (devDependency). Solo usa
 * `@prisma/client` y `bcrypt`, que son dependencias de producción normales.
 *
 * Uso:
 *   node scripts/create-admin.js --username admin --password "ContraseñaSegura123!"
 *
 * También acepta las variables de entorno ADMIN_USERNAME / ADMIN_PASSWORD
 * como alternativa a los flags. Requiere que DATABASE_URL esté definida en el
 * entorno (la misma que usa la app en producción).
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
  const { username: argUsername, password: argPassword } = parseArgs();
  const username = argUsername ?? process.env.ADMIN_USERNAME;
  const password = argPassword ?? process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      'Faltan datos. Uso: node scripts/create-admin.js --username <usuario> --password <contraseña>\n' +
        '(o define ADMIN_USERNAME / ADMIN_PASSWORD como variables de entorno)',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
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
