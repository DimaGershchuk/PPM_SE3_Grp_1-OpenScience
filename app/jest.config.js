module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/tests/Util/Scheduler.test.js',
        '<rootDir>/tests/Util/PsychObject.test.js',
        '<rootDir>/tests/Util/EventEmitter.test.js',
        '<rootDir>/tests/core/EventManager.test.js',
        '<rootDir>/tests/core/Logger.test.js'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/src/visual/',
        '<rootDir>/src/gui/',
        '<rootDir>/src/display/',
        '<rootDir>/src/input/',
        '<rootDir>/src/interaction/',
        'node_modules'
    ],
    moduleNameMapper: {
        // Map core backend dependencies to mocks
        '.*ServerManager.js$': '<rootDir>/tests/__mocks__/ServerManager.js',
        '.*PsychoJS.js$': '<rootDir>/tests/__mocks__/PsychoJS.js'
    },
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    rootDir: '.'
}; 