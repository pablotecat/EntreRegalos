const { spawnSync, spawn } = require('node:child_process');
const path = require('node:path');

const database = new URL(process.env.DATABASE_URL ?? '');
if (!['postgresql:', 'postgres:'].includes(database.protocol) ||
    !['127.0.0.1', 'localhost'].includes(database.hostname) || !database.pathname.endsWith('_e2e')) {
  throw new Error('Playwright requires an explicit local, disposable database whose name ends in _e2e');
}

const cwd = path.join(__dirname, '../backend');
for (const command of [
  'npx prisma generate',
  'npx prisma migrate deploy',
  'npm run seed',
  'npm run build',
]) {
  const result = spawnSync(command, { cwd, shell: true, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn(process.execPath, ['dist/main.js'], { cwd, stdio: 'inherit' });
server.on('error', (error) => { throw error; });
server.on('exit', (code) => process.exit(code ?? 1));
