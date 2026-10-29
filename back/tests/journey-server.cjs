const fs = require('node:fs');
const { randomUUID, randomBytes } = require('node:crypto');
const url = process.env.JOURNEY_DATABASE_URL;
if (!url || new URL(url).hostname !== '127.0.0.1' || new URL(url).port !== '55482' || !new URL(url).pathname.startsWith('/health_journey_')) throw new Error('A dedicated journey test database is required');
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:19008';
const { prisma } = require('../src/database/prisma');
const { Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { createApplication } = require('../src/app');
const { stockEntry } = require('../src/services/stock/stock-service');
async function seed() {
  const run = randomUUID().slice(0,8), password = 'Journey-' + randomBytes(12).toString('hex');
  const users = {};
  const hash = await bcrypt.hash(password, 10);
  for (const role of Object.values(Role)) {
    const user = await prisma.user.create({ data: { username: `journey.${run}.${role}`, name: `TESTE ${role}`, phone: `${run}-${role}`, password: hash, role } });
    users[role] = { id: user.id, username: user.username, password, role };
  }
  const root = await prisma.category.create({ data: { name: 'Clínica' } });
  const category = await prisma.category.create({ data: { name: 'Consultas', categoryId: root.id } });
  const labCategory = await prisma.category.create({ data: { name: 'Laboratório' } });
  const drugCategory = await prisma.category.create({ data: { name: 'Farmácia' } });
  const consultation = await prisma.service.create({ data: { name: 'Consulta de teste', unit_price: 1000, categoryId: category.id, type: 'SERVICE', discount: 0 } });
  const exam = await prisma.service.create({ data: { name: 'Hemograma de teste', unit_price: 500, categoryId: labCategory.id, type: 'SERVICE', discount: 0 } });
  const section = await prisma.section.create({ data: { name: 'Hematologia' } });
  await prisma.exam.create({ data: { serviceId: exam.id, name: 'Hemograma de teste', isHeader: false, input: 'TEXT', reference: 'Teste sintético', sectionId: section.id } });
  const drug = await prisma.service.create({ data: { name: 'Medicamento sintético', unit_price: 100, categoryId: drugCategory.id, type: 'PRODUCT', unitsPerPackage: 1, discount: 0 } });
  const material = await prisma.service.create({ data: { name: 'Consumível sintético', unit_price: 10, categoryId: drugCategory.id, type: 'PRODUCT', discount: 0 } });
  await prisma.stockLocation.updateMany({ data: { isDefault: false } });
  const location = await prisma.stockLocation.create({ data: { name: 'Armazém de teste', isDefault: true } });
  for (const product of [drug, material]) await prisma.$transaction(tx => stockEntry(tx, { productId: product.id, locationId: location.id, quantity: 100, batch: `LOT-${run}`, expiration: new Date('2035-12-31'), userId: users.inventory.id }));
  const payment = await prisma.payment.create({ data: { name: 'Numerário teste', code: run } });
  await prisma.company.create({ data: { name: 'Clínica de Teste', nif: 'TESTE', address: 'Ambiente isolado', phone: '000000000' } });
  const fixture = { run, users, services: { consultation, exam, drug, material }, location, payment, api: 'http://127.0.0.1:18020/api' };
  return fixture;
}
(async () => {
  const fixture = process.env.JOURNEY_REUSE_FIXTURE === "1" ? JSON.parse(fs.readFileSync("/tmp/health-journey-fixture.json")) : await seed();
  const { server, io } = createApplication();
  await new Promise(resolve => server.listen(18020, '127.0.0.1', resolve));
  fs.writeFileSync('/tmp/health-journey-fixture.json', JSON.stringify(fixture), { mode: 0o600 });
  console.log(`Journey test API ready on 127.0.0.1:18020; ${Object.keys(fixture.users).length} test roles`);
  const stop = async () => { await new Promise(resolve => io.close(resolve)); await prisma.$disconnect(); process.exit(0); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
})().catch(async error => { console.error(error.message); await prisma.$disconnect(); process.exit(1); });
