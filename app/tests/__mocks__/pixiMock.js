// Mock PIXI.js
const PIXI = {
    Application: class {
        constructor() {
            this.renderer = {
                view: {
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    style: {}
                },
                plugins: {
                    interaction: {
                        moveWhenInside: false,
                        interactionFrequency: 10
                    }
                },
                resize: jest.fn(),
                render: jest.fn()
            };
            this.stage = {
                addChild: jest.fn(),
                removeChild: jest.fn()
            };
            this.ticker = {
                add: jest.fn(),
                remove: jest.fn(),
                start: jest.fn(),
                stop: jest.fn()
            };
        }
    },
    Container: class {
        constructor() {
            this.children = [];
            this.addChild = jest.fn();
            this.removeChild = jest.fn();
        }
    },
    Graphics: class {
        constructor() {
            this.clear = jest.fn();
            this.beginFill = jest.fn().mockReturnThis();
            this.drawRect = jest.fn().mockReturnThis();
            this.endFill = jest.fn().mockReturnThis();
        }
    },
    filters: {
        ColorMatrixFilter: class {
            constructor() {
                this.brightness = 1;
                this.contrast = 1;
            }
        }
    },
    Loader: class {
        constructor() {
            this.add = jest.fn();
            this.load = jest.fn();
        }
        static registerPlugin() {}
    },
    settings: {
        SCALE_MODE: 0,
        ROUND_PIXELS: false
    },
    utils: {
        skipHello: jest.fn()
    }
};

// Export everything
module.exports = PIXI;
// Also export named exports for ES modules
Object.entries(PIXI).forEach(([key, value]) => {
    module.exports[key] = value;
});

// Export AdjustmentFilter mock
module.exports.AdjustmentFilter = class {
    constructor() {
        this.gamma = 1;
        this.saturation = 1;
        this.contrast = 1;
        this.brightness = 1;
        this.alpha = 1;
    }
}; 