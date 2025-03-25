module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    moduleFileExtensions: ['js', 'json'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
}; 