/**
 * @file
 * @source ./lib/ref/index.js
 * @description Function to manage refs
 */

/**
 * @template T
 * @typedef {{current:T}} Ref
 */

/**
 * @template T
 * @param {T} initValue
 * @returns {Ref<T>}
 */
export const useRef = initValue => ({ current: initValue });
