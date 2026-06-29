/**
 * @file
 * @source ./lib/flatten-childs
 * @description Function to flatten arrays with chids to just the not arr elements
 */

/**
 * @import { State } from "#lib/state";
 */

/**
 * @typedef {Array<Element|string|null|State<any>|ElementRecursiveArray>} ElementRecursiveArray
 */

/**
 * @param {ElementRecursiveArray} children
 * @returns {Array<Element|State<any>|string|null>}
 */
export const flattenChildren = children => children.reduce(
	/**
	 * @param {Array<Element|State<any>|string|null>} acc
	 * @param {ElementRecursiveArray[number]} ch
	 * @returns {Array<Element|State<any>|string|null>}
	 */
	(acc, ch) =>
	{
		Array.isArray(ch) ? acc.push(...flattenChildren(ch)) : acc.push(ch);
		return acc;
	}, []
);
