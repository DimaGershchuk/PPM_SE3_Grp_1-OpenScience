import { EventManager } from '../../src/EventManager.js';
import { MonotonicClock } from '../../src/util/Clock.js';

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
    expect(eventManager).to.be.an.instanceof(EventManager);
  });

  /**
    * Verify that key presses are stored in the internal _keyBuffer
    * and that getKeys() returns those key presses.
    */

  test('should store key presses and retrieve them with getKeys()', () => {
    // Imitaion that buffer have two keys
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
    expect(allKeys).to.deep.equal(['a', 'b']);

    // Перевіряємо, що після виклику getKeys буфер очищено від відповідних клавіш
    expect(eventManager._keyBuffer).to.have.lengthOf(0);
  });

  /**
    * Check that the timeStamped parameter returns an array of [key, timestamp].
 */
  test('should return time-stamped keys when timeStamped=true', () => {
    // Іmitation one click:
    eventManager._keyBuffer.push({
      code: 'KeyX',
      key: 'x',
      keyCode: 88,
      timestamp: 0.999
    });

    const keysWithTime = eventManager.getKeys({ timeStamped: true });
    expect(keysWithTime).to.have.lengthOf(1);
    expect(keysWithTime[0]).to.deep.equal(['x', 0.999]);
  });

  /**
    /**
    * Check that when using keyList:
    *  - only the desired keys remain in the result of getKeys()
    *  - unwanted keys remain in the buffer
 */
  test('should filter keys by keyList and keep unmatched keys in buffer', () => {
    eventManager._keyBuffer.push({ code: 'KeyA', key: 'a', keyCode: 65, timestamp: 0.1 });
    eventManager._keyBuffer.push({ code: 'KeyB', key: 'b', keyCode: 66, timestamp: 0.2 });
    eventManager._keyBuffer.push({ code: 'KeyC', key: 'c', keyCode: 67, timestamp: 0.3 });

    // Take only 'a' і 'c':
    const keysAC = eventManager.getKeys({ keyList: ['a', 'c'] });
    expect(keysAC).to.deep.equal(['a', 'c']);

    // Check, if buffer has 'b'
    expect(eventManager._keyBuffer).to.have.lengthOf(1);
    expect(eventManager._keyBuffer[0].key).to.equal('b');
  });

  /**
   * Check clearEvents() and clearKeys().
   */
  test('should clear events and keys correctly', () => {
    eventManager._keyBuffer.push({ code: 'KeyA', key: 'a', keyCode: 65, timestamp: 0.5 });
    expect(eventManager._keyBuffer).to.have.lengthOf(1);

    // Call clearKeys()
    eventManager.clearKeys();
    expect(eventManager._keyBuffer).to.have.lengthOf(0);

    // Imitation one more click
    eventManager._keyBuffer.push({ code: 'KeyZ', key: 'z', keyCode: 90, timestamp: 1.0 });
    expect(eventManager._keyBuffer).to.have.lengthOf(1);

    eventManager.clearEvents();
    expect(eventManager._keyBuffer).to.have.lengthOf(0);
  });

 /**
    * Check the correctness of the static methods pyglet2w3c and keycode2w3c
    * to ensure the mapping between pyglet and W3C works properly.
 */
  test('should correctly map pyglet key names to W3C codes (pyglet2w3c)', () => {
    // For example, pyglet 'a' => W3C 'KeyA'
    const result = EventManager.pyglet2w3c(['a', 'slash', 'num_0']);
    expect(result).to.deep.equal(['KeyA', 'Slash', 'Numpad0']);
  });

  test('should correctly map legacy keycode to W3C code (keycode2w3c)', () => {
    // Check, if keyCode=65 gives "KeyA"
    const w3c = EventManager.keycode2w3c(65);
    expect(w3c).to.equal('KeyA');
  });

  /**
    Check the mouse state: ensure the default _mouseInfo structure matches expectations.
   */
  test('should initialize mouseInfo properly', () => {
    const mouseInfo = eventManager.getMouseInfo();
    expect(mouseInfo).to.have.property('pos').that.is.an('array').with.lengthOf(2);
    expect(mouseInfo).to.have.property('wheelRel').that.is.an('array').with.lengthOf(2);
    expect(mouseInfo).to.have.property('buttons').that.is.an('object');
    expect(mouseInfo.buttons).to.have.property('pressed').that.is.an('array').with.lengthOf(3);
    expect(mouseInfo.buttons).to.have.property('clocks').that.is.an('array').with.lengthOf(3);
    expect(mouseInfo.buttons).to.have.property('times').that.is.an('array').with.lengthOf(3);
  });
});
