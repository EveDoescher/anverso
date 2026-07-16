import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nodeModules = resolve(root, 'node_modules');

const env = {
  ...process.env,
  NODE_PATH: process.env.NODE_PATH
    ? `${nodeModules}:${process.env.NODE_PATH}`
    : nodeModules,
};

const child = spawn('next', ['dev'], { env, stdio: 'inherit', shell: true });
child.on('exit', code => process.exit(code ?? 0));
