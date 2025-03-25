export class EventManager {
    constructor() {
        this._events = new Map();
    }

    on(eventName, callback) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, new Set());
        }
        this._events.get(eventName).add(callback);
    }

    off(eventName, callback) {
        if (this._events.has(eventName)) {
            this._events.get(eventName).delete(callback);
        }
    }

    emit(eventName, data) {
        if (this._events.has(eventName)) {
            for (const callback of this._events.get(eventName)) {
                try {
                    callback(data);
                } catch (error) {
                    // Handle errors gracefully
                    console.error('Error in event listener:', error);
                }
            }
        }
    }

    clear() {
        this._events.clear();
    }
} 