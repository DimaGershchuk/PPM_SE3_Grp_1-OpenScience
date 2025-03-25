import { ServerManager } from './ServerManager';

export class PsychoJS {
    constructor(params = {}) {
        this.debug = params.debug || false;
        this.serverManager = new ServerManager();
        this.window = null;
        this.gui = null;
        this.config = {
            experiment: {
                name: 'testExp',
                status: 'RUNNING',
                fullpath: 'test/path'
            }
        };
    }

    getEnvironment = jest.fn().mockReturnValue('TEST');
    experimentLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };
} 