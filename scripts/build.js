import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = path.join(root, 'client');
const vite = [path.join(client, 'node_modules', 'vite', 'bin', 'vite.js'), path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')].find(existsSync);
if (!vite) throw new Error('Vite is missing. Run the project setup command before building.');
const build = spawn(process.execPath, [vite, 'build', '--configLoader', 'runner'], { cwd: client, stdio: 'inherit' });
build.once('error', error => { console.error(error); process.exitCode = 1; });
build.once('close', code => { process.exitCode = code ?? 1; });
