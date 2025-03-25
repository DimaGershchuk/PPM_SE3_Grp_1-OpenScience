// Mock createjs
global.createjs = {
    LoadQueue: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
        loadFile: jest.fn(),
        load: jest.fn()
    }))
};

// Mock WebGL context since we're in a test environment
global.WebGLRenderingContext = jest.fn();
global.WebGL2RenderingContext = jest.fn();

// Mock window properties that PIXI.js needs
global.window = global;
global.window.addEventListener = jest.fn();
global.document = {
    createElement: jest.fn(() => ({
        getContext: jest.fn(() => ({
            getExtension: jest.fn(),
            getParameter: jest.fn(),
            getSupportedExtensions: jest.fn(() => [])
        }))
    })),
    addEventListener: jest.fn()
};

// Suppress specific console messages
const originalError = console.error;
console.error = (...args) => {
    if (args[0]?.includes('WebGL not available')) return;
    originalError.apply(console, args);
}; 