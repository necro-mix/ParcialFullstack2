import { JSDOM } from 'jsdom';

const dom = new JSDOM('', { url: 'http://localhost' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.Event = dom.window.Event;

beforeEach(() => {
  localStorage.clear();
});

afterAll(() => {
  dom.window.close();
});
