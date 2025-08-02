/**
 * @vitest-environment jsdom
*/
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { 
    State, 
    useState, 
    useRef, 
    createElement, 
    Fragment, 
    useClient, 
    startClient 
} from '../index.js';

describe('State Class', () => {
    test('should initialize with correct values', () => {
        const stringState = new State('hello');
        expect(stringState.get()).toBe('hello');
        expect(stringState.valueOf()).toBe('hello');

        const numberState = new State(42);
        expect(numberState.get()).toBe(42);

        const objectState = new State({ name: 'test' });
        expect(objectState.get()).toEqual({ name: 'test' });

        const nullState = new State(null);
        expect(nullState.get()).toBeNull();
        const undefinedState = new State(undefined);
        expect(undefinedState.get()).toBeUndefined();
    });

    test('should update value', () => {
        const state = new State('initial');
        expect(state.get()).toBe('initial');
        expect(state.valueOf()).toBe('initial');

        state.set('updated');
        expect(state.get()).toBe('updated');
        expect(state.valueOf()).toBe('updated');

        state.set(42);
        expect(state.get()).toBe(42);
        expect(state.valueOf()).toBe(42);

        state.set({ name: 'test' });
        expect(state.get()).toEqual({ name: 'test' });
    });

    test('should appendOnChange callback', () => {
        const state = new State('initial');
        const callback = vi.fn();
        state.appendOnChange(callback);
        state.set('updated');
        expect(callback).toHaveBeenCalledWith('updated');
    });
});

describe('useState Hook', () => {
    test('should return a state object', () => {
        const [state, setState] = useState('initial');
        expect(state.get()).toBe('initial');
        expect(state.valueOf()).toBe('initial');
        setState('updated');
        expect(state.get()).toBe('updated');
        expect(state.valueOf()).toBe('updated');

        const [state2, setState2] = useState(42);
        expect(state2.get()).toBe(42);
        expect(state2.valueOf()).toBe(42);
        setState2(43);
        expect(state2.get()).toBe(43);
        expect(state2.valueOf()).toBe(43);

        const [state3, setState3] = useState({ name: 'test' });
        expect(state3.get()).toEqual({ name: 'test' });
        expect(state3.valueOf()).toEqual({ name: 'test' });
        setState3({ name: 'test2' });
    });

    test('should change state value', () => {
        const [state, setState] = useState('initial');
        expect(state.get()).toBe('initial');
        expect(state.valueOf()).toBe('initial');
        setState('updated');
        expect(state.get()).toBe('updated');
        expect(state.valueOf()).toBe('updated');
    });
});