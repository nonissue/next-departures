import { readFile } from 'fs/promises';
import path from 'node:path';

const fetchConfig = async () => {
  const configPath = path.join(import.meta.dirname, '..', 'config.json');
  return JSON.parse(await readFile(configPath, 'utf-8'));
};

export default fetchConfig;
