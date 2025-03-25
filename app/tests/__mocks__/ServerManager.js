export class ServerManager {
    constructor() {
        this._preloadQueue = {
            addEventListener: jest.fn(),
            loadFile: jest.fn(),
            load: jest.fn()
        };
    }

    on = jest.fn();
    emit = jest.fn();
    _setupPreloadQueue = jest.fn();
}

export const Event = {
    RESOURCE: 'RESOURCE',
    LOG: 'LOG',
    ERROR: 'ERROR'
}; 