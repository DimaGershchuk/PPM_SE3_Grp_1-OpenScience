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
}

module.exports = ServerManager;

export const Event = {
    RESOURCE: 'RESOURCE',
    LOG: 'LOG',
    ERROR: 'ERROR'
}; 