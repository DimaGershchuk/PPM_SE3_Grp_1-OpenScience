module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.spec.js'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/src/visual/',
        '<rootDir>/src/gui/',
        '<rootDir>/src/display/',
        '<rootDir>/src/input/',
        '<rootDir>/src/interaction/',
        'node_modules'
    ],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    rootDir: '.',
    verbose: true,
    transformIgnorePatterns: [
        'node_modules/(?!(createjs|pixi.js-legacy)/)'
    ],
    testEnvironmentOptions: {
        url: 'http://localhost'
    }
}; 