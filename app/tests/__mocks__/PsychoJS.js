import { PsychObject } from '../../../src/util/PsychObject.js';
import { MonotonicClock } from '../../../src/util/Clock.js';

// Simple ServerManager mock
class ServerManager extends PsychObject {
    constructor({ psychoJS }) {
        super(psychoJS);
        this._psychoJS = psychoJS;
    }

    log(msg, level, obj) {
        console[level.toLowerCase()](msg, obj);
    }
}

export class PsychoJS extends PsychObject {
    constructor({
        debug = false,
        collectIP = false,
        topLevelStatus = true
    } = {}) {
        super();

        this._debug = debug;
        this._collectIP = collectIP;
        this._topLevelStatus = topLevelStatus;

        // setup the logger:
        this.logger = null;

        // setup the server manager with minimal mock:
        this._serverManager = {
            log: (msg, level, obj) => {
                console[level.toLowerCase()](msg, obj);
            }
        };

        // setup the experiment handler:
        this._experiment = null;

        // setup the window:
        this._window = null;

        // setup the scheduler:
        this._scheduler = null;

        // setup the clock:
        this.clock = new MonotonicClock();

        // setup the status:
        this._status = 'CREATED';

        // setup the config:
        this._config = {
            environment: 'TEST',
            experiment: {
                name: 'test',
                fullpath: 'test',
                saveFormat: 'CSV',
                saveIncompleteResults: true,
                license: 'GPL',
                runMode: 'TEST'
            },
            session: {
                status: 'OPEN'
            }
        };
    }

    getEnvironment() {
        return this._config.environment;
    }

    experimentEnded() {
        this._status = 'ENDED';
    }

    quit() {
        this._status = 'QUIT';
    }

    static get Status() {
        return {
            CREATED: Symbol.for('CREATED'),
            STARTED: Symbol.for('STARTED'),
            PAUSED: Symbol.for('PAUSED'),
            STOPPED: Symbol.for('STOPPED'),
            FINISHED: Symbol.for('FINISHED'),
            ERROR: Symbol.for('ERROR'),
            QUIT: Symbol.for('QUIT')
        };
    }
} 