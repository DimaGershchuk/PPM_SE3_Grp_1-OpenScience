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
        '<rootDir>/src/util/Pixi.js',
        '<rootDir>/src/**/GUI*.js',
        '<rootDir>/src/**/gui*.js',
        '<rootDir>/tests/visual/',
        '<rootDir>/tests/gui/',
        '<rootDir>/tests/**/GUI*.test.js',
        '<rootDir>/tests/**/gui*.test.js',
        'node_modules'
    ],
    moduleNameMapper: {
        // Static assets
        '\\.(css|less|sass|scss)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js',
        // Core dependencies - all possible import paths
        '(.*)/src/core/ServerManager.js': '<rootDir>/tests/__mocks__/ServerManager.js',
        '(.*)/src/core/PsychoJS.js': '<rootDir>/tests/__mocks__/PsychoJS.js'
    },
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    rootDir: '.'
}; 