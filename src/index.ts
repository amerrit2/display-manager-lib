import AJV, { ValidateFunction } from 'ajv';
import { JSONSchema7 } from 'json-schema';

import { VcpCodes } from './vcp';
import { graphics } from 'systeminformation';
import iohook from 'iohook';
import { resolve } from 'path';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { getMonitorList } from '@hensm/ddcci';
import { flipInput, getAllInputs } from './monitors';
import { getWindowConfiguration } from './windows';

const { APPDATA: appDataDir } = process.env;
if (!appDataDir) throw new Error('Failed to determine AppData directory. Are you on windows?');

const readJson = async (inputPath: string) => JSON.parse(`${await readFile(inputPath)}`);
const appDir = resolve(appDataDir, 'display-manager');

const ajv = new AJV({
    useDefaults: true,
    allErrors: true,
});

type Modifier = 'alt' | 'ctrl' | 'meta' | 'shift';
type Configurations = {
    keyBinding: {
        modifier: Modifier;
        keycode: number;
    };
    monitors: {
        id: string;
        codes: Record<VcpCodes, number>;
    }[];
}[];

const configSchema: JSONSchema7 = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            keyBinding: {
                type: 'object',
                properties: {
                    modifier: { type: 'string', enum: ['alt', 'crtl', 'meta', 'shift'] },
                    keycode: { type: 'number' },
                },
                additionalProperties: false,
            },
            monitors: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        codes: {
                            type: 'object',
                            patternProperties: {
                                '.*': { type: 'number' },
                            },
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
        additionalProperties: false,
    },
};

const validateConfig: ValidateFunction<Configurations> = ajv.compile(configSchema);

interface KeydownEvent {
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    keycode: number;
    rawcode: number;
    type: 'keydown';
}

function hasModifier(modifier: string, event: KeydownEvent) {
    switch (modifier) {
        case 'alt':
            return event.altKey;
        case 'shift':
            return event.shiftKey;
        case 'ctrl':
            return event.ctrlKey;
        case 'meta':
            return event.metaKey;
        default:
            throw new Error(`Unknown modifier "${modifier}"`);
    }
}

async function pathExists(url: string) {
    try {
        await stat(url);
        return true;
    } catch {
        return false;
    }
}

(async function main() {
    const configPath = resolve(appDir, 'config.json');
    if (!(await pathExists(appDir))) {
        await mkdir(appDir);
    }

    if (!(await pathExists(configPath))) {
        console.log(`Writing new config file to '${configPath}'`);
        await writeFile(configPath, JSON.stringify([]));
    }

    const configurations = await readJson(configPath);

    if (!validateConfig(configurations)) {
        throw new Error(`Invalid config. e=\n${JSON.stringify(validateConfig.errors)}`);
    }

    const monitors = getMonitorList();

    console.log('monitors: ', monitors);
    console.log('Current Monitor inputs: ', await getAllInputs());

    await getWindowConfiguration();
    // iohook.on('keydown', (data: KeydownEvent) => {
    //     if (data.keycode === 2 && data.altKey === true) {
    //         for (const mon of monitors) {
    //             setVCP(mon, VcpCodes.INPUT_SOURCE, flipInput(getVCP(mon, VcpCodes.INPUT_SOURCE)[0]));
    //         }
    //     }
    // });

    iohook.unload();

    // iohook.start();

    // setVCP(monitors[1], VcpCodes.INPUT_SOURCE, 17);

    // const byProcess = windows.reduce((out, win) => {
    //     const { processId } = win;
    //     if (processId in win) {
    //         win[processId].push()
    //     }
    //     return out;
    // }, {} as Record<string, any>);
})().catch((e) => {
    iohook.removeAllListeners();
    iohook.unload();
    console.error(e);
});
