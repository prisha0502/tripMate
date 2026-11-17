import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = spawn(process.execPath, [path.join(root, 'scripts', 'dev-client.js')], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, TRIPMATE_INLINE_API: '1' },
});
const children = [client];
let stopping = false;

function stop(signal = 'SIGINT') {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill(signal);
}

process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
for (const child of children) {
  child.once('error', error => { console.error(error); stop('SIGTERM'); process.exitCode = 1; });
  child.once('close', code => {
    if (!stopping && code !== 0) { process.exitCode = code ?? 1; stop('SIGTERM'); }
  });
}
