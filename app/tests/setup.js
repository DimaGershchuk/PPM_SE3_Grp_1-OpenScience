// Set up JSDOM-like environment
const createDOMEnvironment = () => {
    // Create root element with classList functionality
    const rootElement = {
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn()
        }
    };

    // Set up global objects
    global.window = global;
    global.document = {
        createElement: jest.fn(() => ({
            getContext: jest.fn(() => ({
                getExtension: jest.fn(),
                getParameter: jest.fn(),
                getSupportedExtensions: jest.fn(() => [])
            }))
        })),
        addEventListener: jest.fn(),
        getElementById: jest.fn((id) => {
            if (id === 'root') return rootElement;
            return null;
        })
    };

    // Add window event listener
    global.window.addEventListener = jest.fn();

    // Mock WebGL contexts
    global.WebGLRenderingContext = jest.fn();
    global.WebGL2RenderingContext = jest.fn();

    // Mock createjs
    global.createjs = {
        LoadQueue: jest.fn().mockImplementation(() => ({
            addEventListener: jest.fn(),
            loadFile: jest.fn(),
            load: jest.fn()
        }))
    };
};

// Initialize the DOM environment
createDOMEnvironment();

// Suppress specific console messages
const originalError = console.error;
console.error = (...args) => {
    if (args[0]?.includes('WebGL not available')) return;
    originalError.apply(console, args);
}; 