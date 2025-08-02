/**
 * @vitest-environment jsdom
*/
import { describe, test, expect, beforeEach, vi } from 'vitest';

const importFresh = async () => {
    vi.resetModules();
    const Lex = await import('../index.js');
    return Lex;
};

describe('createElement Function', () => {
    test('should always return a new element', async () => {
        const Lex = await importFresh();
        const element1 = Lex.createElement('div', {}, 'Hello, world!');
        const element2 = Lex.createElement('div', {}, 'Hello, world!');
        expect(element1.tagName).toBe('DIV');
        expect(element2.tagName).toBe('DIV');
        expect(element1.textContent).toBe('Hello, world!');
        expect(element2.textContent).toBe('Hello, world!');
    });
    test('should never execute useClient', async () => {
        const Lex = await importFresh();
        const callback = vi.fn();
        Lex.useClient(callback);
        expect(callback).not.toHaveBeenCalled();
        Lex.mount(document.createElement('div'));
        expect(callback).not.toHaveBeenCalled();
    });
    test('should every element have a lexid attribute', async () => {
        const Lex = await importFresh();
        const element = Lex.createElement('div', {}, 'Hello, world!');
        expect(element.getAttribute('lexid')).toBe("0");
        const element2 = Lex.createElement('div', {}, 'Hello, world!');
        expect(element2.getAttribute('lexid')).toBe("1");
        const element3 = Lex.createElement('div', {}, 'Hello, world!');
        expect(element3.getAttribute('lexid')).toBe("2");
    });
});