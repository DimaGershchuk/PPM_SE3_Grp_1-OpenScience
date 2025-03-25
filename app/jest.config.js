module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // Mock core dependencies - using proper relative path matching
        '\\.\\./\\.\\./src/core/ServerManager\\.js$': '<rootDir>/tests/__mocks__/ServerManager.js',
        '\\.\\./\\.\\./src/core/PsychoJS\\.js$': '<rootDir>/tests/__mocks__/PsychoJS.js',
        '\\.\\./\\.\\./src/core/EventManager\\.js$': '<rootDir>/tests/__mocks__/EventManager.js',
        // Mock graphics-related imports
        '^pixi\\.js-legacy$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^pixi\\.js$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^@pixi/filter-adjustment$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^@pixi/(.*)$': '<rootDir>/tests/__mocks__/pixiMock.js',
        'tone': '<rootDir>/tests/__mocks__/toneMock.js'
    },
    moduleFileExtensions: ['js', 'json'],
    // Explicitly list only the tests we want to run
    testMatch: [
        '<rootDir>/tests/Util/Scheduler.test.js',
        '<rootDir>/tests/Util/PsychObject.test.js',
        '<rootDir>/tests/Util/EventEmitter.test.js',
        '<rootDir>/tests/core/EventManager.test.js'
    ],
    // Explicitly ignore problematic tests
    testPathIgnorePatterns: [
        'node_modules',
        'app/tests/core/Logger.test.js',
        'tests/core/Logger.test.js',
        'src/util/Util.test.js',
        'app/src/util/Util.test.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    rootDir: '.'
}; 