// Mock createjs before any imports
global.createjs = {
    LoadQueue: class LoadQueue {
        constructor() {
            this.listeners = new Map();
            this.Types = {
                BINARY: 'binary',
                TEXT: 'text'
            };
        }

        addEventListener(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }

        removeEventListener(event, callback) {
            if (this.listeners.has(event)) {
                const callbacks = this.listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        }

        loadFile(file) {
            // Mock file loading
            setTimeout(() => {
                this._triggerEvent('filestart', { item: { id: file.id } });
                this._triggerEvent('fileload', { item: { id: file.id }, result: 'mock data' });
            }, 0);
        }

        load() {
            // Mock loading completion
            setTimeout(() => {
                this._triggerEvent('complete', {});
            }, 0);
        }

        getResult(id) {
            return 'mock result';
        }

        getProgress() {
            return 1;
        }

        close() {
            // Mock cleanup
        }

        _triggerEvent(event, data) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(callback => callback(data));
            }
        }
    },
    Types: {
        BINARY: 'binary',
        TEXT: 'text'
    },
    Sound: {
        registerSound: jest.fn(),
        play: jest.fn(),
        stop: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        setVolume: jest.fn(),
        getVolume: jest.fn()
    }
};

// Mock log4javascript
global.log4javascript = {
    getLogger: () => ({
        addAppender: jest.fn(),
        setLevel: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
        getLevel: () => ({ toString: () => 'INFO' })
    }),
    Level: {
        ALL: { toString: () => 'ALL' },
        TRACE: { toString: () => 'TRACE' },
        DEBUG: { toString: () => 'DEBUG' },
        INFO: { toString: () => 'INFO' },
        WARN: { toString: () => 'WARN' },
        ERROR: { toString: () => 'ERROR' },
        FATAL: { toString: () => 'FATAL' },
        OFF: { toString: () => 'OFF' }
    },
    BrowserConsoleAppender: function() {
        return {
            setLayout: jest.fn(),
            setThreshold: jest.fn(),
            getLayout: jest.fn()
        };
    }
};

// Set up minimal test environment
global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: () => {},
    cancelAnimationFrame: () => {},
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    location: {
        hostname: 'localhost',
        origin: 'http://localhost',
        protocol: 'http:',
        href: 'http://localhost'
    },
    URL: {
        createObjectURL: () => 'mock-url',
        revokeObjectURL: () => {}
    }
};

// Create a root element with classList
const rootElement = {
    classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
    }
};

global.document = {
    createElement: () => ({
        getContext: () => ({
            measureText: () => ({ width: 100 })
        }),
        style: {}
    }),
    getElementById: (id) => {
        if (id === 'root') {
            return rootElement;
        }
        return null;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    documentElement: {
        style: {}
    },
    body: {
        appendChild: () => {},
        removeChild: () => {}
    }
};

// Suppress specific console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
    if (
        !args[0]?.includes('WebGL') &&
        !args[0]?.includes('Tone.js') &&
        !args[0]?.includes('deprecated')
    ) {
        originalWarn.apply(console, args);
    }
};

// Mock PIXI
jest.mock('pixi.js-legacy', () => ({}));

// Set up Jest timers
jest.useFakeTimers(); 