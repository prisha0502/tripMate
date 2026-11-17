import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = path.join(root, 'client');
const vite = [path.join(client, 'node_modules', 'vite', 'bin', 'vite.js'), path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')].find(existsSync);
if (!vite) throw new Error('Vite is missing. Run the project setup command before starting the client.');

function run(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [vite, ...args], { cwd: client, stdio: 'inherit', env });
    child.once('error', reject);
    child.once('close', code => resolve(code ?? 1));
  });
}

const buildCode = await run(['build', '--configLoader', 'runner'], {
  ...process.env,
  TRIPMATE_INLINE_API: '0',
});
if (buildCode !== 0) process.exit(buildCode);
const preview = spawn(process.execPath, [vite, 'preview', '--host', '0.0.0.0', '--port', '5173', '--configLoader', 'runner'], { cwd: client, stdio: 'inherit' });
const stop = () => preview.kill('SIGINT');
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
preview.once('error', error => { console.error(error); process.exitCode = 1; });
preview.once('close', code => { process.exitCode = code ?? 0; });
