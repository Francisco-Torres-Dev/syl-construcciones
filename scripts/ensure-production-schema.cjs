const { spawnSync } = require('node:child_process');

if (process.env.VERCEL_ENV !== 'production') {
  console.log('Skipping production database schema setup outside Vercel Production.');
  process.exit(0);
}

console.log('Synchronizing the Prisma schema with the production database.');

const result = spawnSync('npm', ['--prefix', 'server', 'run', 'db:setup'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('Could not start the production database schema setup:', result.error.message);
  process.exitCode = 1;
} else if (result.status !== 0) {
  console.error(`Production database schema setup failed${result.signal ? ` (${result.signal})` : ''}.`);
  process.exitCode = result.status ?? 1;
}
