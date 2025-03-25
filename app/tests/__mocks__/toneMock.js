// Mock Tone.js
const Tone = {
    start: jest.fn(),
    Transport: {
        start: jest.fn(),
        stop: jest.fn(),
        pause: jest.fn(),
        schedule: jest.fn(),
        scheduleOnce: jest.fn(),
        cancel: jest.fn()
    },
    now: jest.fn().mockReturnValue(0),
    immediate: jest.fn().mockReturnValue(0),
    Destination: {
        volume: {
            value: 0
        }
    }
};

module.exports = Tone; 