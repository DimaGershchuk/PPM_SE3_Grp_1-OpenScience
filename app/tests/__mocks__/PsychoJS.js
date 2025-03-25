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
        this._serverManager = new ServerManager(this);
        this._serverMsg = [];
        
        this.status = 'INITIALIZED';
        this.config = {
            experiment: {
                name: 'testExp',
                fullpath: '/tests/testExp',
                status: 'RUNNING'
            }
        };
    }

    get serverManager() {
        return this._serverManager;
    }

    getEnvironment() {
        return 'TEST';
    }

    experimentEnded() {
        return false;
    }

    log(msg) {
        this._serverMsg.push({ level: 'INFO', msg });
        this._serverManager.log({ level: 'INFO', msg });
        return this;
    }

    debug(msg) {
        this._serverMsg.push({ level: 'DEBUG', msg });
        this._serverManager.debug(msg);
        return this;
    }

    info(msg) {
        this._serverMsg.push({ level: 'INFO', msg });
        this._serverManager.info(msg);
        return this;
    }

    warn(msg) {
        this._serverMsg.push({ level: 'WARNING', msg });
        this._serverManager.warn(msg);
        return this;
    }

    error(msg) {
        this._serverMsg.push({ level: 'ERROR', msg });
        this._serverManager.error(msg);
        return this;
    }
}

module.exports = PsychoJS; 