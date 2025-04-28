// src/tests/util/GUI.test.js

// MOCK TONE
jest.mock('tone', () => ({
    start: jest.fn()
  }));
  
  import { GUI } from '../../../src/core/GUI';
  import { PsychoJS } from '../../../src/core/PsychoJS';
  
  describe('GUI Class', () => {
    let psychoJS;
    let gui;
  
    beforeEach(() => {
      psychoJS = {
        serverManager: {
          on: jest.fn()
        },
        getEnvironment: jest.fn(() => "LOCAL"),
        window: { adjustScreenSize: jest.fn() },
        eventManager: { clearEvents: jest.fn() },
        logger: { fatal: jest.fn(), debug: jest.fn() },
        config: { experiment: { fullpath: 'testPath' } }
      };
      gui = new GUI(psychoJS);
      document.body.innerHTML = `<div id="root"></div>`; // Mock basic DOM structure
    });
  
    test('should create a GUI instance', () => {
      expect(gui).toBeInstanceOf(GUI);
    });
  
    test('DlgFromDict should return a scheduler function', () => {
      const dlgFunc = gui.DlgFromDict({
        dictionary: { participant: '001' },
        title: 'Test Experiment'
      });
      expect(typeof dlgFunc).toBe('function');
    });
  
    test('dialog() should create and show a dialog', () => {
      gui.dialog({ message: 'Test Message' });
  
      const dialog = document.getElementById('experiment-dialog');
      expect(dialog).not.toBeNull();
      expect(dialog.getAttribute('role')).toBe('alertdialog');
    });
  
    test('finishDialog() should create a finish dialog', () => {
      gui.finishDialog({ text: 'Uploading...' });
  
      const dialog = document.getElementById('experiment-dialog');
      expect(dialog).not.toBeNull();
      expect(dialog.innerHTML).toContain('Uploading...');
    });
  
    test('closeDialog() should hide the dialog', () => {
      gui.dialog({ message: 'Test Message' });
      gui.closeDialog();
  
      expect(gui._dialog.shown).toBe(false); // Updated: check hidden, not null
    });
  });
  