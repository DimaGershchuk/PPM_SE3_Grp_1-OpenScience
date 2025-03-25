// Mock ServerManager
class ServerManager {
    constructor(psychoJS) {
        this._psychoJS = psychoJS;
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
        // Mock event subscription
        return this;
    }

    emit(event, data) {
        // Mock event emission
        return this;
    }

    // Add logging methods
    log(msg) {
        return this;
    }

    debug(msg) {
        return this;
    }

    info(msg) {
        return this;
    }

    warn(msg) {
        return this;
    }

    error(msg) {
        return this;
    }
}

// Export both the class and Event constants
module.exports = ServerManager;
module.exports.Event = {
    RESOURCE: 'RESOURCE',
    LOG: 'LOG',
    ERROR: 'ERROR'
}; 