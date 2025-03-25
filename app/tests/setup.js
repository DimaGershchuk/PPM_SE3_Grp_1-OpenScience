// Mock createjs (required by ServerManager)
global.createjs = {
    LoadQueue: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
        loadFile: jest.fn(),
        load: jest.fn()
    }))
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

// Suppress console warnings we can't fix
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

// Set up minimal test environment
const setupTestEnvironment = () => {
    // Set up only essential globals needed for backend tests
    global.window = {
        addEventListener: jest.fn()
    };
};

// Initialize the test environment
setupTestEnvironment(); 