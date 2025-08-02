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
    test('should execute the callback just once after startClient', async () => {
        const Lex = await importFresh();
        const callback = vi.fn();
        Lex.useClient(callback);
        expect(callback).not.toHaveBeenCalled();
        Lex.startClient();
        expect(callback).toHaveBeenCalledOnce();
    });
});