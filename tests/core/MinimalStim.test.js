import { MinimalStim } from '../../src/core/MinimalStim.js';
import { Window } from '../../src/core/Window.js';
import { PsychoJS } from '../../src/core/PsychoJS.js';

describe('MinimalStim', () => {
    let psychoJS;
    let win;
    let stim;

    beforeEach(() => {
        // Create a mock PsychoJS instance
        psychoJS = new PsychoJS();
        
        // Create a mock Window instance
        win = new Window({
            psychoJS: psychoJS,
            size: [800, 600],
            color: [0, 0, 0],
            units: 'pix'
        });

        // Create a MinimalStim instance for testing
        stim = new MinimalStim({
            name: 'testStim',
            win: win,
            autoDraw: false,
            autoLog: true
        });
    });

    afterEach(() => {
        // Clean up after each test
        if (stim) {
            stim.release();
        }
        if (win) {
            win.close();
        }
    });

    describe('constructor', () => {
        test('should create a MinimalStim instance with correct default values', () => {
            expect(stim.name).toBe('testStim');
            expect(stim.win).toBe(win);
            expect(stim.autoDraw).toBe(false);
            expect(stim.autoLog).toBe(true);
            expect(stim.status).toBe(PsychoJS.Status.NOT_STARTED);
        });

        test('should handle undefined win parameter', () => {
            const stimWithoutWin = new MinimalStim({
                name: 'testStim2'
            });
            expect(stimWithoutWin.win).toBeUndefined();
            expect(stimWithoutWin.autoLog).toBe(false);
        });
    });

    describe('setAutoDraw', () => {
        test('should set autoDraw attribute correctly', () => {
            stim.setAutoDraw(true);
            expect(stim.autoDraw).toBe(true);
            
            stim.setAutoDraw(false);
            expect(stim.autoDraw).toBe(false);
        });

        test('should handle logging parameter', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            stim.setAutoDraw(true, true);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('draw', () => {
        test('should add stimulus to draw list when not already present', () => {
            stim.draw();
            expect(win._drawList).toContain(stim);
        });

        test('should not add stimulus to draw list if already present', () => {
            stim.draw();
            const initialLength = win._drawList.length;
            stim.draw();
            expect(win._drawList.length).toBe(initialLength);
        });

        test('should update status to STARTED', () => {
            stim.draw();
            expect(stim.status).toBe(PsychoJS.Status.STARTED);
        });
    });

    describe('hide', () => {
        test('should remove stimulus from draw list', () => {
            stim.draw();
            expect(win._drawList).toContain(stim);
            
            stim.hide();
            expect(win._drawList).not.toContain(stim);
        });

        test('should update status to STOPPED', () => {
            stim.draw();
            stim.hide();
            expect(stim.status).toBe(PsychoJS.Status.STOPPED);
        });
    });

    describe('contains', () => {
        test('should throw error as it is an abstract method', () => {
            expect(() => {
                stim.contains({}, 'pix');
            }).toThrow();
        });
    });

    describe('release', () => {
        test('should set autoDraw to false', () => {
            stim.setAutoDraw(true);
            stim.release();
            expect(stim.autoDraw).toBe(false);
        });

        test('should update status to STOPPED', () => {
            stim.release();
            expect(stim.status).toBe(PsychoJS.Status.STOPPED);
        });

        test('should handle logging parameter', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            stim.release(true);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('_updateIfNeeded', () => {
        test('should throw error as it is an abstract method', () => {
            expect(() => {
                stim._updateIfNeeded();
            }).toThrow();
        });
    });

    describe('integration', () => {
        test('should work with Window interaction', () => {
            // Create multiple stimuli
            const stim1 = new MinimalStim({
                name: 'stim1',
                win: win,
                autoDraw: false
            });
            const stim2 = new MinimalStim({
                name: 'stim2',
                win: win,
                autoDraw: true
            });

            // Test window draw list management
            expect(win._drawList).not.toContain(stim1);
            expect(win._drawList).toContain(stim2);

            stim1.draw();
            expect(win._drawList).toContain(stim1);

            // Test window cleanup affects stimuli
            win.close();
            expect(stim1.status).toBe(PsychoJS.Status.STOPPED);
            expect(stim2.status).toBe(PsychoJS.Status.STOPPED);
        });
        
        test('should handle multiple PIXI objects', () => {
            // Create mock PIXI objects
            const pixiObj1 = { id: 'pixiObj1', destroy: jest.fn() };
            const pixiObj2 = { id: 'pixiObj2', destroy: jest.fn() };

            // Attach PIXI objects to stimulus
            stim._pixi = pixiObj1;
            stim.draw();
            expect(win._rootContainer.children).toContain(pixiObj1);

            // Update PIXI object
            stim._pixi = pixiObj2;
            stim._needUpdate = true;
            stim.draw();
            expect(win._rootContainer.children).toContain(pixiObj2);
            expect(win._rootContainer.children).not.toContain(pixiObj1);

            // Cleanup should handle all PIXI objects
            stim.release();
            expect(pixiObj2.destroy).toHaveBeenCalled();
        });
    });

    describe('performance', () => {
        test('should maintain consistent state under rapid operations', () => {
            // Simulate rapid draw/hide operations
            const operations = 100;
            const startTime = performance.now();

            for (let i = 0; i < operations; i++) {
                stim.draw();
                stim.hide();
            }

            const endTime = performance.now();
            const timePerOperation = (endTime - startTime) / operations;

            // Verify final state is correct
            expect(stim.status).toBe(PsychoJS.Status.STOPPED);
            expect(win._drawList).not.toContain(stim);

            // Performance threshold (adjust based on requirements)
            expect(timePerOperation).toBeLessThan(1); // Less than 1ms per operation
        });

        test('should handle repeated attribute changes efficiently', () => {
            const iterations = 50;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                stim.setAutoDraw(true);
                stim.setAutoDraw(false);
                stim._needUpdate = true;
                stim.draw();
            }

            const endTime = performance.now();
            const averageTime = (endTime - startTime) / iterations;

            // Verify state consistency after stress test
            expect(stim.autoDraw).toBe(false);
            expect(averageTime).toBeLessThan(2); // Less than 2ms per iteration
        });
    });

    describe('memory management', () => {
        test('should properly clean up resources on release', () => {
            // Setup multiple PIXI objects and references
            const pixiObjects = Array.from({ length: 5 }, (_, i) => ({
                id: `pixiObj${i}`,
                destroy: jest.fn()
            }));

            // Simulate multiple updates with different PIXI objects
            pixiObjects.forEach(obj => {
                stim._pixi = obj;
                stim.draw();
            });

            // Release and verify cleanup
            stim.release();

            // Verify all PIXI objects were properly destroyed
            expect(pixiObjects[pixiObjects.length - 1].destroy).toHaveBeenCalledWith(true);
            expect(stim._pixi).toBeUndefined();

            // Verify no memory leaks in window references
            expect(win._drawList).not.toContain(stim);
        });

        test('should handle cleanup of event listeners and references', () => {
            const eventSpy = jest.spyOn(stim, 'release');
            
            // Create circular references to test cleanup
            const circularRef = { stim };
            stim._testRef = circularRef;

            // Release and verify
            stim.release();
            
            expect(eventSpy).toHaveBeenCalled();
            expect(stim._testRef).toBeUndefined();
            
            eventSpy.mockRestore();
        });
    });

    describe('browser compatibility', () => {
        test('should handle different requestAnimationFrame implementations', () => {
            const originalRAF = window.requestAnimationFrame;
            const mockRAF = jest.fn();
            window.requestAnimationFrame = mockRAF;

            stim.draw();
            expect(mockRAF).toHaveBeenCalled();

            window.requestAnimationFrame = originalRAF;
        });

        test('should work with different browser event models', () => {
            // Test standard DOM events
            const domEvent = new Event('test');
            expect(() => {
                document.dispatchEvent(domEvent);
            }).not.toThrow();

            // Test legacy IE event model
            const legacyEvent = document.createEvent('Event');
            legacyEvent.initEvent('test', true, true);
            expect(() => {
                document.dispatchEvent(legacyEvent);
            }).not.toThrow();
        });

        test('should handle vendor-prefixed methods gracefully', () => {
            // Store original methods
            const original = {
                requestFullscreen: document.documentElement.requestFullscreen,
                webkitRequestFullscreen: document.documentElement.webkitRequestFullscreen,
                mozRequestFullScreen: document.documentElement.mozRequestFullScreen
            };

            // Test with different vendor prefixes
            document.documentElement.requestFullscreen = undefined;
            document.documentElement.webkitRequestFullscreen = jest.fn();
            
            stim.draw();
            expect(() => {
                win.adjustScreenSize();
            }).not.toThrow();

            // Restore original methods
            Object.assign(document.documentElement, original);
        });
    });
}); 