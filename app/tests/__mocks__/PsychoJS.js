const ServerManager = require('./ServerManager');

class PsychoJS {
    constructor({
        debug = false,
        collectIP = false,
        hosts = [],
    } = {}) {
        this._debug = debug;
        this._hosts = hosts;
        this._collectIP = collectIP;
        
        // Create the server manager without relying on createjs
        this._serverManager = new ServerManager(this);
        
        // Add other commonly used properties
        this.status = 'INITIALIZED';
        this.config = {
            experiment: {
                name: 'testExp',
                fullpath: '/tests/testExp',
                status: 'RUNNING'
            }
        };
        this.window = null;
        this.logger = null;
        this._serverMsg = [];
    }

    // Add any methods that Logger.test.js might need
    getEnvironment() {
        return 'TEST';
    }

    experimentEnded() {
        return false;
    }

    // Add getter for serverManager
    get serverManager() {
        return this._serverManager;
    }

    // Add logging methods that might be needed
    log(msg) {
        this._serverMsg.push(msg);
        return this;
    }

    debug(msg) {
        return this.log(msg);
    }

    info(msg) {
        return this.log(msg);
    }

    warn(msg) {
        return this.log(msg);
    }

    error(msg) {
        return this.log(msg);
    }
}

module.exports = PsychoJS; 