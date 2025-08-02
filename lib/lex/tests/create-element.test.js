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
    test('should create a new element after startClient', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const element = Lex.createElement('div', {}, 'Hello, world!');
        expect(element.tagName).toBe('DIV');
        expect(element.textContent).toBe('Hello, world!');
    });
    test('should select an element if it exists before startClient', async () => {
        const Lex = await importFresh();
        const element = document.createElement('div');
        element.setAttribute('lexid', '0');
        document.body.appendChild(element);

        const selectedElement = Lex.createElement('div', {}, 'Hello, world!');

        expect(selectedElement).toBe(element);
        Lex.startClient();
    });

    test('should accept a function as a tag', async () => {
        const Lex = await importFresh();

        Lex.startClient();

        const MyComponent = ({children}) => Lex.createElement('div', {}, children);

        const element = Lex.createElement(MyComponent, {}, 'Hello, world!');
        expect(element.tagName).toBe('DIV');
        expect(element.textContent).toBe('Hello, world!');
    });

    test('should accept a state as a prop', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const state = new Lex.State('class1');
        const element = Lex.createElement('div', {className: state});
        expect(element.className).toBe('class1');
        state.set('class2');
        expect(element.className).toBe('class2');
    });
    test('should accept a state as a child', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const state = new Lex.State('Hello, world!');
        const element = Lex.createElement('div', {}, state);
        expect(element.textContent).toBe('Hello, world!');
        state.set('Hello, world! 2');
        expect(element.textContent).toBe('Hello, world! 2');
    });
    test('should accept ref as a prop', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const ref = Lex.useRef(null);
        const element = Lex.createElement('div', {ref});
        expect(ref.current).toBe(element);
    });
    test('should accept event handlers as props', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const handleClick = vi.fn();
        const element = Lex.createElement('button', {onClick: handleClick}, "Click me");
        element.click();
        expect(handleClick).toHaveBeenCalledOnce();
    });
    test('should accept fragment as a child', async () => {
        const Lex = await importFresh();
        Lex.startClient();
        const fragment = Lex.createElement(Lex.Fragment, {}, 'Hello, world!');
        const element = Lex.createElement('div', {}, fragment);
        expect(element.textContent).toBe('Hello, world!');
    });
});