// Mock createjs (required by ServerManager)
global.createjs = {
    LoadQueue: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
        loadFile: jest.fn(),
        load: jest.fn()
    }))
};

// Set up minimal test environment
global.window = {
    addEventListener: jest.fn()
};

// Suppress console warnings
const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && (
        args[0].includes('WebGL not available') ||
        args[0].includes('Tone.js')
    )) {
        return;
    }
    originalConsoleError(...args);
};

// Mock window and document
global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    requestAnimationFrame: jest.fn(),
    cancelAnimationFrame: jest.fn(),
    innerWidth: 800,
    innerHeight: 600,
    devicePixelRatio: 1,
    location: {
        hostname: 'localhost'
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

// Mock WebGL context
global.WebGLRenderingContext = {
    VERTEX_SHADER: 'VERTEX_SHADER',
    FRAGMENT_SHADER: 'FRAGMENT_SHADER',
    ARRAY_BUFFER: 'ARRAY_BUFFER',
    ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
    STATIC_DRAW: 'STATIC_DRAW'
};

// Set up minimal test environment for backend tests
const setupTestEnvironment = () => {
    global.window = {
        addEventListener: jest.fn()
    };
};

setupTestEnvironment(); 