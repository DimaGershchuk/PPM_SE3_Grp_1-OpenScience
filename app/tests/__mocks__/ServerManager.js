// Mock ServerManager
class ServerManager {
    constructor(psychoJS) {
        this._psychoJS = psychoJS;
        this._eventCallbacks = new Map();
        this._setupPreloadQueue();
    }

    _setupPreloadQueue() {
        // Mock the preload queue without using createjs
        this._preloadQueue = {
            addEventListener: jest.fn(),
            loadFile: jest.fn(),
            load: jest.fn()
        };
    }

    getResourceManager() {
        return {
            scheduleRegistration: jest.fn(),
            registerResource: jest.fn(),
            downloadResources: jest.fn().mockResolvedValue(true)
        };
    }

    // Add event emitter methods
    on(event, callback) {
        if (!this._eventCallbacks.has(event)) {
            this._eventCallbacks.set(event, []);
        }
        this._eventCallbacks.get(event).push(callback);
        return this;
    }

    emit(event, data) {
        if (this._eventCallbacks.has(event)) {
            this._eventCallbacks.get(event).forEach(callback => callback(data));
        }
        return this;
    }

    // Add logging methods
    log(msg) {
        this.emit(ServerManager.Event.LOG, msg);
        return this;
    }

    debug(msg) {
        return this.log({ level: 'DEBUG', msg });
    }

    info(msg) {
        return this.log({ level: 'INFO', msg });
    }

    warn(msg) {
        return this.log({ level: 'WARNING', msg });
    }

    error(msg) {
        return this.log({ level: 'ERROR', msg });
    }
}

// Export both the class and Event constants
ServerManager.Event = {
    RESOURCE: 'RESOURCE',
    LOG: 'LOG',
    ERROR: 'ERROR'
};

module.exports = ServerManager; 