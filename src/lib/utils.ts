import { readFile } from 'fs/promises';
import path from 'node:path';
import { Config } from '../types/global.js';

/**
 * Validates the configuration object for GTFS import
 * @param config The configuration object to validate
 * @throws Error if agencies are missing or if agency lacks both url and path
 * @returns The validated config object
 */
export function validateConfigForImport(config: Config) {
  if (!config.agencies || config.agencies.length === 0) {
    throw new Error('No `agencies` specified in config');
  }

  for (const [index, agency] of config.agencies.entries()) {
    if (!agency.path && !agency.url) {
      throw new Error(
        `No Agency \`url\` or \`path\` specified in config for agency index ${index}.`,
      );
    }
  }

  if (!config.sqlitePath) {
    throw new Error('No sqlitePath provided!');
  }

  return config;
}

export const getConfig = async () => {
  try {
    // const configPath = '/Users/apw/code/node-gtfs-pg/config.json';
    const configPath = path.join(
      import.meta.dirname,
      '..',
      '..',
      'config.json',
    );
    return JSON.parse(await readFile(configPath, 'utf-8'));
  } catch (error: any) {
    throw new Error(error);
  }
};

/**
 * Ensures time components have leading zeros (e.g., "9:5:1" -> "09:05:01")
 * @param time Time string in HH:mm:ss format
 * @returns Formatted time string with leading zeros, or null if invalid format
 */
export function padLeadingZeros(time: string) {
  const split = time.split(':').map((d) => String(Number(d)).padStart(2, '0'));
  if (split.length !== 3) {
    throw new Error(
      "padLeadingZeros: input must be a string in the form 'HH:MM:SS'",
    );
  }

  return split.join(':');
}
