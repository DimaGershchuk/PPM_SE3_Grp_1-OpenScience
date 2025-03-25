import { EventManager } from '../../src/core/EventManager.js';

describe('EventManager', () => {
    let eventManager;

    beforeEach(() => {
        eventManager = new EventManager();
    });

    afterEach(() => {
        eventManager = null;
    });

    describe('Basic Event Handling', () => {
        test('should register and trigger event listeners', () => {
            const mockCallback = jest.fn();
            eventManager.on('test-event', mockCallback);
            
            eventManager.emit('test-event', { data: 'test' });
            expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
        });

        test('should handle multiple listeners for same event', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            eventManager.on('test-event', mockCallback1);
            eventManager.on('test-event', mockCallback2);
            
            eventManager.emit('test-event', { data: 'test' });
            
            expect(mockCallback1).toHaveBeenCalledWith({ data: 'test' });
            expect(mockCallback2).toHaveBeenCalledWith({ data: 'test' });
        });

        test('should remove event listeners correctly', () => {
            const mockCallback = jest.fn();
            eventManager.on('test-event', mockCallback);
            eventManager.off('test-event', mockCallback);
            
            eventManager.emit('test-event', { data: 'test' });
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle errors in event listeners gracefully', () => {
            const errorCallback = () => {
                throw new Error('Test error');
            };
            
            eventManager.on('error-event', errorCallback);
            
            // Should not throw
            expect(() => {
                eventManager.emit('error-event');
            }).not.toThrow();
        });
    });

    describe('Cleanup', () => {
        test('should clear all listeners', () => {
            const mockCallback = jest.fn();
            eventManager.on('test-event', mockCallback);
            
            eventManager.clear();
            
            eventManager.emit('test-event', { data: 'test' });
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });
}); 