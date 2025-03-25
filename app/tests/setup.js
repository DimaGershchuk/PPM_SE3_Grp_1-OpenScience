// Mock createjs at the global level
global.createjs = {
    LoadQueue: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
        loadFile: jest.fn(),
        load: jest.fn()
    }))
};

// Set up minimal test environment
const setupTestEnvironment = () => {
    // Set up global objects
    global.window = global;
    global.document = {
        createElement: jest.fn(),
        addEventListener: jest.fn()
    };

    // Add window event listener
    global.window.addEventListener = jest.fn();
};

// Initialize the test environment
setupTestEnvironment();

// Suppress specific console messages
const originalError = console.error;
console.error = (...args) => {
    if (args[0]?.includes('WebGL not available')) return;
    originalError.apply(console, args);
}; 