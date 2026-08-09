import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed...');

  // Usuario admin por defecto
  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';

  const existe = await prisma.user.findUnique({ where: { username: adminUsername } });

  if (existe) {
    console.log(`ℹ️  El usuario "${adminUsername}" ya existe, omitiendo.`);
  } else {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: hash,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Usuario admin creado: "${adminUsername}"`);
  }

  // Primera invitación de prueba
  const invExiste = await prisma.invitation.findFirst({
    where: { reference: 'Invitación inicial de prueba' },
  });

  if (!invExiste) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { username: adminUsername } });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    const inv = await prisma.invitation.create({
      data: {
        reference: 'Invitación inicial de prueba',
        expiresAt,
        createdById: admin.id,
      },
    });
    console.log(`✅ Invitación de prueba creada: ${inv.token}`);
    console.log(`🔗 URL: http://localhost:3000/register?token=${inv.token}`);
  }

  console.log('🌱 Seed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
