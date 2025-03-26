// Mock createjs (required by ServerManager) - MUST BE AT THE TOP
global.createjs = {
    LoadQueue: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn().mockReturnThis(),
        loadFile: jest.fn().mockReturnThis(),
        load: jest.fn().mockReturnThis(),
        getResult: jest.fn(),
        getProgress: jest.fn(),
        close: jest.fn().mockReturnThis(),
        removeEventListener: jest.fn().mockReturnThis(),
        removeAllEventListeners: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis(),
        dispatchEvent: jest.fn().mockReturnThis(),
        hasEventListener: jest.fn()
    })),
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

// Set up minimal test environment
global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    requestAnimationFrame: jest.fn(),
    cancelAnimationFrame: jest.fn(),
    innerWidth: 800,
    innerHeight: 600,
    devicePixelRatio: 1,
    location: {
        hostname: 'localhost',
        origin: 'http://localhost',
        protocol: 'http:',
        href: 'http://localhost'
    }
};

global.document = {
    createElement: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    documentElement: {
        style: {}
    },
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    }
};

// Suppress specific console warnings
const originalConsoleError = console.error;
console.error = (...args) => {
    const message = args.join(' ');
    
    // Only suppress specific WebGL errors from PIXI
    if (message.includes('WebGL not available') && 
        message.includes('CompressedTextureLoader')) {
        return;
    }
    
    // Only suppress specific Tone.js initialization message
    if (message.includes('Tone.js') && 
        message.includes('v14.7.77')) {
        return;
    }
    
    originalConsoleError(...args);
};

// Mock PIXI
jest.mock('pixi.js-legacy', () => ({})); 