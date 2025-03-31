import { EventManager } from '../../../src/core/EventManager.js';
import { MonotonicClock } from '../../../src/util/Clock.js';

class MockPsychoJS {
    constructor() {
      this.logger = {
        trace: jest.fn(),
        debug: jest.fn(),
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
      this.experimentLogger = {
        data: jest.fn(),
      };
      this._monotonicClock = new MonotonicClock();
    }
  }
  
  describe('EventManager', () => {
    let eventManager;
    let mockPsychoJS;
  
    beforeEach(() => {
      mockPsychoJS = new MockPsychoJS();
      eventManager = new EventManager(mockPsychoJS);
    });
  
    test('should instantiate correctly', () => {
      expect(eventManager).toBeInstanceOf(EventManager);
    });
  
    /**
     * Verify that key presses are stored in the internal _keyBuffer
     * and that getKeys() returns those key presses.
     */
    test('should store key presses and retrieve them with getKeys()', () => {
      // Imitate that the buffer contains two keys
      eventManager._keyBuffer.push({
        code: 'KeyA',
        key: 'a',
        keyCode: 65,
        timestamp: 0.123
      });
      eventManager._keyBuffer.push({
        code: 'KeyB',
        key: 'b',
        keyCode: 66,
        timestamp: 0.456
      });
  
      const allKeys = eventManager.getKeys({ timeStamped: false });
      expect(allKeys).toEqual(['a', 'b']);
  
      // Verify that after calling getKeys the keys are removed from the buffer
      expect(eventManager._keyBuffer).toHaveLength(0);
    });
  
    /**
     * Check that the timeStamped parameter returns an array of [key, timestamp].
     */
    test('should return time-stamped keys when timeStamped=true', () => {
      // Imitate one key press:
      eventManager._keyBuffer.push({
        code: 'KeyX',
        key: 'x',
        keyCode: 88,
        timestamp: 0.999
      });
  
      const keysWithTime = eventManager.getKeys({ timeStamped: true });
      expect(keysWithTime).toHaveLength(1);
      expect(keysWithTime[0]).toEqual(['x', 0.999]);
    });
  
    /**
     * Check that when using keyList:
     *  - only the desired keys are returned by getKeys()
     *  - keys not in the list remain in the buffer.
     */
    test('should filter keys by keyList and keep unmatched keys in buffer', () => {
      eventManager._keyBuffer.push({ code: 'KeyA', key: 'a', keyCode: 65, timestamp: 0.1 });
      eventManager._keyBuffer.push({ code: 'KeyB', key: 'b', keyCode: 66, timestamp: 0.2 });
      eventManager._keyBuffer.push({ code: 'KeyC', key: 'c', keyCode: 67, timestamp: 0.3 });
  
      // Request only 'a' and 'c'
      const keysAC = eventManager.getKeys({ keyList: ['a', 'c'] });
      expect(keysAC).toEqual(['a', 'c']);
  
      // Verify that the buffer still contains the key 'b'
      expect(eventManager._keyBuffer).toHaveLength(1);
      expect(eventManager._keyBuffer[0].key).toBe('b');
    });
  
    /**
     * Check clearEvents() and clearKeys().
     */
    test('should clear events and keys correctly', () => {
      eventManager._keyBuffer.push({ code: 'KeyA', key: 'a', keyCode: 65, timestamp: 0.5 });
      expect(eventManager._keyBuffer).toHaveLength(1);
  
      // Call clearKeys()
      eventManager.clearKeys();
      expect(eventManager._keyBuffer).toHaveLength(0);
  
      // Imitate one more key press
      eventManager._keyBuffer.push({ code: 'KeyZ', key: 'z', keyCode: 90, timestamp: 1.0 });
      expect(eventManager._keyBuffer).toHaveLength(1);
  
      eventManager.clearEvents();
      expect(eventManager._keyBuffer).toHaveLength(0);
    });
  
    /**
     * Check the correctness of the static methods pyglet2w3c and keycode2w3c
     * to ensure the mapping between pyglet and W3C works properly.
     */
    test('should correctly map pyglet key names to W3C codes (pyglet2w3c)', () => {
      // For example, pyglet 'a' should map to W3C 'KeyA'
      const result = EventManager.pyglet2w3c(['a', 'slash', 'num_0']);
      expect(result).toEqual(['KeyA', 'Slash', 'Numpad0']);
    });
  
    test('should correctly map legacy keycode to W3C code (keycode2w3c)', () => {
      // Check that keyCode=65 gives "KeyA"
      const w3c = EventManager.keycode2w3c(65);
      expect(w3c).toBe('KeyA');
    });
  
    /**
     * Check the mouse state: ensure the default _mouseInfo structure matches expectations.
     */
    test('should initialize mouseInfo properly', () => {
      const mouseInfo = eventManager.getMouseInfo();
      expect(mouseInfo).toHaveProperty('pos');
      expect(Array.isArray(mouseInfo.pos)).toBe(true);
      expect(mouseInfo.pos).toHaveLength(2);
  
      expect(mouseInfo).toHaveProperty('wheelRel');
      expect(Array.isArray(mouseInfo.wheelRel)).toBe(true);
      expect(mouseInfo.wheelRel).toHaveLength(2);
  
      expect(mouseInfo).toHaveProperty('buttons');
      expect(typeof mouseInfo.buttons).toBe('object');
  
      expect(mouseInfo.buttons).toHaveProperty('pressed');
      expect(Array.isArray(mouseInfo.buttons.pressed)).toBe(true);
      expect(mouseInfo.buttons.pressed).toHaveLength(3);
  
      expect(mouseInfo.buttons).toHaveProperty('clocks');
      expect(Array.isArray(mouseInfo.buttons.clocks)).toBe(true);
      expect(mouseInfo.buttons.clocks).toHaveLength(3);
  
      expect(mouseInfo.buttons).toHaveProperty('times');
      expect(Array.isArray(mouseInfo.buttons.times)).toBe(true);
      expect(mouseInfo.buttons.times).toHaveLength(3);
    });
  });
