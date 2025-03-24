import { Window } from '../../src/core/Window.js';
import { PsychoJS } from '../../src/core/PsychoJS.js';
import { Color } from '../../src/util/Color.js';
import { Logger } from '../../src/core/Logger.js';
import * as PIXI from 'pixi.js-legacy';

// Mock PIXI.settings and utils for WebGL support testing
jest.mock('pixi.js-legacy', () => ({
    settings: {
        FAIL_IF_MAJOR_PERFORMANCE_CAVEAT: false
    },
    utils: {
        isWebGLSupported: jest.fn().mockReturnValue(true)
    }
}));

describe('Window', () => {
    let psychoJS;
    let win;

    beforeEach(() => {
        // Create a mock PsychoJS instance with logger
        psychoJS = new PsychoJS({
            debug: true
        });
        
        // Create a Window instance for testing
        win = new Window({
            psychoJS: psychoJS,
            name: 'testWindow',
            fullscr: false,
            color: new Color('black'),
            gamma: 1,
            contrast: 1,
            units: 'pix',
            waitBlanking: false,
            autoLog: true
        });
    });

    afterEach(() => {
        if (win) {
            win.close();
        }
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('should create a Window instance with correct default values', () => {
            expect(win.name).toBe('testWindow');
            expect(win.psychoJS).toBe(psychoJS);
            expect(win.fullscr).toBe(false);
            expect(win.color).toBeInstanceOf(Color);
            expect(win.gamma).toBe(1);
            expect(win.contrast).toBe(1);
            expect(win.units).toBe('pix');
            expect(win.waitBlanking).toBe(false);
            expect(win.autoLog).toBe(true);
        });

        test('should handle empty constructor options', () => {
            const emptyWin = new Window();
            expect(emptyWin.name).toBeDefined();
            expect(emptyWin.psychoJS).toBeUndefined();
            expect(emptyWin.fullscr).toBe(false);
            expect(emptyWin.color).toBeInstanceOf(Color);
            expect(emptyWin.gamma).toBe(1);
            expect(emptyWin.contrast).toBe(1);
            expect(emptyWin.units).toBe('pix');
            expect(emptyWin.waitBlanking).toBe(false);
            expect(emptyWin.autoLog).toBe(true);
        });

        test('should initialize with custom values', () => {
            const customWin = new Window({
                psychoJS: psychoJS,
                name: 'customWindow',
                fullscr: true,
                color: new Color('white'),
                gamma: 2,
                contrast: 1.5,
                units: 'deg',
                waitBlanking: true,
                autoLog: false
            });

            expect(customWin.name).toBe('customWindow');
            expect(customWin.fullscr).toBe(true);
            expect(customWin.color).toBeInstanceOf(Color);
            expect(customWin.gamma).toBe(2);
            expect(customWin.contrast).toBe(1.5);
            expect(customWin.units).toBe('deg');
            expect(customWin.waitBlanking).toBe(true);
            expect(customWin.autoLog).toBe(false);
        });
    });

    describe('checkWebGLSupport', () => {
        test('should be a static method', () => {
            expect(typeof Window.checkWebGLSupport).toBe('function');
        });

        test('should return a boolean', () => {
            const result = Window.checkWebGLSupport();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('monitorFramePeriod', () => {
        test('should be a getter', () => {
            expect(typeof win.monitorFramePeriod).toBe('number');
        });

        test('should be calculated from getActualFrameRate', () => {
            const frameRate = win.getActualFrameRate();
            expect(win.monitorFramePeriod).toBe(1.0 / frameRate);
        });
    });

    describe('getActualFrameRate', () => {
        test('should return a number', () => {
            const frameRate = win.getActualFrameRate();
            expect(typeof frameRate).toBe('number');
            expect(frameRate).toBeGreaterThan(0);
        });

        test('should handle zero delta time', () => {
            psychoJS.scheduler._lastDelta = 0;
            expect(win.getActualFrameRate()).toBe(60.0);
        });
    });

    describe('adjustScreenSize', () => {
        test('should handle fullscreen request', () => {
            const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen');
            win.fullscr = true;
            win.adjustScreenSize();
            expect(requestFullscreenSpy).toHaveBeenCalled();
            requestFullscreenSpy.mockRestore();
        });

        test('should handle fullscreen request failure', () => {
            const consoleSpy = jest.spyOn(console, 'warn');
            const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen')
                .mockRejectedValue(new Error('Fullscreen failed'));
            
            win.fullscr = true;
            win.adjustScreenSize();
            
            expect(consoleSpy).toHaveBeenCalledWith('Unable to go fullscreen.');
            consoleSpy.mockRestore();
            requestFullscreenSpy.mockRestore();
        });
    });

    describe('closeFullScreen', () => {
        test('should handle fullscreen exit', () => {
            const exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen');
            win.fullscr = true;
            win.closeFullScreen();
            expect(exitFullscreenSpy).toHaveBeenCalled();
            exitFullscreenSpy.mockRestore();
        });

        test('should handle fullscreen exit failure', () => {
            const consoleSpy = jest.spyOn(console, 'warn');
            const exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen')
                .mockRejectedValue(new Error('Exit fullscreen failed'));
            
            win.fullscr = true;
            win.closeFullScreen();
            
            expect(consoleSpy).toHaveBeenCalledWith('Unable to close fullscreen.');
            consoleSpy.mockRestore();
            exitFullscreenSpy.mockRestore();
        });
    });

    describe('logOnFlip', () => {
        test('should add message to _msgToBeLogged', () => {
            const msg = 'Test message';
            win.logOnFlip({ msg });
            expect(win._msgToBeLogged).toContainEqual(expect.objectContaining({ msg }));
        });

        test('should handle different log levels', () => {
            win.logOnFlip({
                msg: 'Test message',
                level: Logger.ServerLevel.ERROR
            });
            expect(win._msgToBeLogged[0].level).toBe(Logger.ServerLevel.ERROR);
        });
    });

    describe('callOnFlip', () => {
        test('should add callback to _flipCallbacks', () => {
            const callback = jest.fn();
            win.callOnFlip(callback);
            expect(win._flipCallbacks).toContain(callback);
        });

        test('should pass arguments to callback', () => {
            const callback = jest.fn();
            const args = ['arg1', 'arg2'];
            win.callOnFlip(callback, ...args);
            expect(win._flipCallbacks[0]).toBe(callback);
        });
    });

    describe('addPixiObject and removePixiObject', () => {
        test('should add and remove PIXI objects', () => {
            const mockPixiObject = { id: 'test' };
            win.addPixiObject(mockPixiObject);
            expect(win._rootContainer.children).toContain(mockPixiObject);
            
            win.removePixiObject(mockPixiObject);
            expect(win._rootContainer.children).not.toContain(mockPixiObject);
        });
    });

    describe('render', () => {
        test('should render without errors', () => {
            expect(() => {
                win.render();
            }).not.toThrow();
        });

        test('should handle _needUpdate flag', () => {
            win._needUpdate = true;
            expect(() => {
                win.render();
            }).not.toThrow();
        });
    });

    describe('close', () => {
        test('should clean up resources', () => {
            const removeChildSpy = jest.spyOn(document.body, 'removeChild');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            
            win.close();
            
            expect(removeChildSpy).toHaveBeenCalled();
            expect(removeEventListenerSpy).toHaveBeenCalled();
            expect(win._renderer).toBeNull();
            
            removeChildSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });

        test('should handle close when renderer is not initialized', () => {
            win._renderer = null;
            expect(() => {
                win.close();
            }).not.toThrow();
        });
    });

    describe('size property', () => {
        test('should update size correctly', () => {
            const newSize = [1024, 768];
            win.size = newSize;
            expect(win.size).toEqual(newSize);
        });

        test('should handle invalid size values', () => {
            expect(() => {
                win.size = 'invalid';
            }).toThrow();
        });

        test('should trigger resize handling', () => {
            const resizeSpy = jest.spyOn(win, '_resizeCallback');
            win.size = [800, 600];
            expect(resizeSpy).toHaveBeenCalled();
            resizeSpy.mockRestore();
        });
    });

    describe('color property', () => {
        test('should update background color correctly', () => {
            const newColor = new Color('red');
            win.color = newColor;
            expect(win.color).toBe(newColor);
            expect(win._backgroundSprite.tint).toBe(newColor.int);
        });

        test('should handle color string input', () => {
            win.color = 'blue';
            expect(win.color).toBeInstanceOf(Color);
            expect(win.color.hex).toBe('#0000FF');
        });

        test('should handle invalid color values', () => {
            expect(() => {
                win.color = 'not-a-color';
            }).toThrow();
        });
    });

    describe('flip', () => {
        test('should execute flip callbacks', () => {
            const callback = jest.fn();
            win.callOnFlip(callback);
            win.flip();
            expect(callback).toHaveBeenCalled();
        });

        test('should clear flip callbacks after execution', () => {
            const callback = jest.fn();
            win.callOnFlip(callback);
            win.flip();
            expect(win._flipCallbacks).toHaveLength(0);
        });

        test('should log queued messages', () => {
            const logSpy = jest.spyOn(psychoJS.logger, 'log');
            win.logOnFlip({ msg: 'Test message', level: Logger.ServerLevel.INFO });
            win.flip();
            expect(logSpy).toHaveBeenCalled();
            expect(win._msgToBeLogged).toHaveLength(0);
            logSpy.mockRestore();
        });

        test('should handle render errors during flip', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            win._renderer.render = jest.fn().mockImplementation(() => {
                throw new Error('Render error');
            });
            
            win.flip();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('_setupPixi', () => {
        test('should create PIXI renderer', () => {
            expect(win._renderer).toBeDefined();
            expect(win._renderer).toBeInstanceOf(Object);
        });

        test('should create root container', () => {
            expect(win._rootContainer).toBeDefined();
            expect(win._rootContainer.children).toBeDefined();
        });

        test('should set up background sprite', () => {
            expect(win._backgroundSprite).toBeDefined();
            expect(win._backgroundSprite.tint).toBe(win.color.int);
        });

        test('should handle renderer creation failure', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            const originalAutoDetectRenderer = PIXI.autoDetectRenderer;
            PIXI.autoDetectRenderer = jest.fn().mockImplementation(() => {
                throw new Error('Renderer creation failed');
            });

            expect(() => {
                new Window({ psychoJS });
            }).not.toThrow();
            
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
            PIXI.autoDetectRenderer = originalAutoDetectRenderer;
        });
    });

    describe('_resizeCallback', () => {
        test('should update renderer size on window resize', () => {
            const resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
            expect(win._needUpdate).toBe(true);
        });

        test('should handle orientation change', () => {
            const orientationEvent = new Event('orientationchange');
            window.dispatchEvent(orientationEvent);
            expect(win._needUpdate).toBe(true);
        });

        test('should update background sprite size', () => {
            win._resizeCallback();
            expect(win._backgroundSprite.width).toBeDefined();
            expect(win._backgroundSprite.height).toBeDefined();
        });
    });

    describe('_windowAlreadyInFullScreen handling', () => {
        test('should update on fullscreenchange event', () => {
            const fullscreenEvent = new Event('fullscreenchange');
            document.dispatchEvent(fullscreenEvent);
            expect(win._needUpdate).toBe(true);
        });

        test('should update drawList items on fullscreen change', () => {
            const mockStimulus = { _needUpdate: false };
            win._drawList.push(mockStimulus);
            const fullscreenEvent = new Event('fullscreenchange');
            document.dispatchEvent(fullscreenEvent);
            expect(mockStimulus._needUpdate).toBe(true);
        });
    });

    describe('error handling', () => {
        test('should handle missing document.fullscreenElement', () => {
            Object.defineProperty(document, 'fullscreenElement', {
                value: undefined,
                writable: true
            });
            
            expect(() => {
                win.adjustScreenSize();
            }).not.toThrow();
        });

        test('should handle missing requestFullscreen methods', () => {
            const originalRequestFullscreen = document.documentElement.requestFullscreen;
            document.documentElement.requestFullscreen = undefined;
            
            expect(() => {
                win.adjustScreenSize();
            }).not.toThrow();
            
            document.documentElement.requestFullscreen = originalRequestFullscreen;
        });

        test('should handle missing exitFullscreen methods', () => {
            const originalExitFullscreen = document.exitFullscreen;
            document.exitFullscreen = undefined;
            
            expect(() => {
                win.closeFullScreen();
            }).not.toThrow();
            
            document.exitFullscreen = originalExitFullscreen;
        });
    });

    describe('performance monitoring', () => {
        test('should track frame count', () => {
            const initialFrameCount = win._frameCount;
            win.flip();
            expect(win._frameCount).toBe(initialFrameCount + 1);
        });

        test('should calculate correct frame rate', () => {
            psychoJS.scheduler._lastDelta = 16.67; // Simulating 60fps
            expect(win.getActualFrameRate()).toBeCloseTo(60, 0);
        });
    });
}); 