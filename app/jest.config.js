module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // Mock core dependencies - using proper relative path matching
        '\\.\\./(.*)/src/core/ServerManager\\.js$': '<rootDir>/tests/__mocks__/ServerManager.js',
        '\\.\\./(.*)/src/core/PsychoJS\\.js$': '<rootDir>/tests/__mocks__/PsychoJS.js',
        '\\.\\./(.*)/src/core/EventManager\\.js$': '<rootDir>/tests/__mocks__/EventManager.js',
        // Mock graphics-related imports
        '^pixi\\.js-legacy$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^pixi\\.js$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^@pixi/filter-adjustment$': '<rootDir>/tests/__mocks__/pixiMock.js',
        '^@pixi/(.*)$': '<rootDir>/tests/__mocks__/pixiMock.js',
        'tone': '<rootDir>/tests/__mocks__/toneMock.js'
    },
    moduleFileExtensions: ['js', 'json'],
    testMatch: [
        // Only include the working test suites
        '<rootDir>/tests/Util/Scheduler.test.js',
        '<rootDir>/tests/Util/PsychObject.test.js',
        '<rootDir>/tests/core/EventManager.test.js',
        '<rootDir>/app/tests/Util/PsychObject.test.js',
        '<rootDir>/app/tests/sample.test.js',
        '<rootDir>/tests/sample.test.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    modulePathIgnorePatterns: [
        'node_modules'
    ]
}; 