import { MinimalStim } from '../../../src/core/MinimalStim.js';
import { Window } from '../../../src/core/Window.js';
import { PsychoJS } from '../../../src/core/PsychoJS.js';

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

        test('should handle empty constructor options', () => {
            const emptyStim = new MinimalStim();
            expect(emptyStim.name).toBeDefined();
            expect(emptyStim.win).toBeUndefined();
            expect(emptyStim.autoDraw).toBe(false);
            expect(emptyStim.autoLog).toBe(false);
        });

        test('should handle null constructor options', () => {
            const nullStim = new MinimalStim(null);
            expect(nullStim.name).toBeDefined();
            expect(nullStim.win).toBeUndefined();
            expect(nullStim.autoDraw).toBe(false);
            expect(nullStim.autoLog).toBe(false);
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

        test('should handle non-boolean autoDraw values', () => {
            stim.setAutoDraw(1);
            expect(stim.autoDraw).toBe(true);
            
            stim.setAutoDraw(0);
            expect(stim.autoDraw).toBe(false);
            
            stim.setAutoDraw('');
            expect(stim.autoDraw).toBe(false);
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

        test('should handle draw without window', () => {
            const stimWithoutWin = new MinimalStim({ name: 'noWin' });
            expect(() => {
                stimWithoutWin.draw();
            }).not.toThrow();
        });

        test('should handle undefined _pixi property', () => {
            stim._pixi = undefined;
            expect(() => {
                stim.draw();
            }).not.toThrow();
        });

        test('should handle _needUpdate flag', () => {
            stim._needUpdate = true;
            stim.draw();
            expect(() => {
                stim.draw();
            }).not.toThrow();
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

        test('should handle hide when not in draw list', () => {
            expect(() => {
                stim.hide();
            }).not.toThrow();
        });

        test('should handle hide without window', () => {
            const stimWithoutWin = new MinimalStim({ name: 'noWin' });
            expect(() => {
                stimWithoutWin.hide();
            }).not.toThrow();
        });

        test('should handle undefined _pixi property', () => {
            stim._pixi = undefined;
            stim.draw();
            expect(() => {
                stim.hide();
            }).not.toThrow();
        });
    });

    describe('contains', () => {
        test('should throw error as it is an abstract method', () => {
            expect(() => {
                stim.contains({}, 'pix');
            }).toThrow();
        });

        test('should include error context in thrown error', () => {
            try {
                stim.contains({}, 'pix');
            } catch (error) {
                expect(error.origin).toBe('MinimalStim.contains');
                expect(error.context).toContain('testStim');
            }
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

        test('should handle release with undefined _pixi', () => {
            stim._pixi = undefined;
            expect(() => {
                stim.release();
            }).not.toThrow();
        });

        test('should properly destroy _pixi object', () => {
            const mockDestroy = jest.fn();
            stim._pixi = { destroy: mockDestroy };
            stim.release();
            expect(mockDestroy).toHaveBeenCalledWith(true);
            expect(stim._pixi).toBeUndefined();
        });
    });

    describe('_updateIfNeeded', () => {
        test('should throw error as it is an abstract method', () => {
            expect(() => {
                stim._updateIfNeeded();
            }).toThrow();
        });

        test('should include error context in thrown error', () => {
            try {
                stim._updateIfNeeded();
            } catch (error) {
                expect(error.origin).toBe('MinimalStim._updateIfNeeded');
                expect(error.context).toContain('testStim');
            }
        });
    });
}); 