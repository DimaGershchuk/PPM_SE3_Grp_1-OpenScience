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
        this.config = {};
        this.window = null;
        this.logger = null;
    }

    // Add any methods that Logger.test.js might need
    getEnvironment() {
        return 'TEST';
    }

    experimentEnded() {
        return false;
    }
}

module.exports = PsychoJS; 