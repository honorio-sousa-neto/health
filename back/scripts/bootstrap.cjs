const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const prisma = new PrismaClient();
async function main() {
  if (await prisma.user.count()) {
    console.log('Instalação existente: utilizadores e catálogos preservados.');
    return;
  }
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password || password.length < 32) throw new Error('Falta a palavra-passe inicial gerada pelo deploy.');
  execFileSync(process.execPath, [path.join(__dirname, '../prisma/seed-all.js'), '--skip-users'], {
    stdio: 'inherit', env: process.env,
  });
  await prisma.user.create({ data: {
    username: 'admin', name: 'Administrador', email: 'admin@alfavida.ao',
    phone: '900000001', role: 'admin', password: await bcrypt.hash(password, 12),
  } });
  console.log('BOOTSTRAP_ADMIN_CREATED');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
