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
                `No Agency \`url\` or \`path\` specified in config for agency index ${index}.`
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
            'app-config.json'
        );
        console.log('Loaded config: ' + configPath);
        return JSON.parse(await readFile(configPath, 'utf-8'));
    } catch (error: any) {
        throw new Error(error);
    }
};
