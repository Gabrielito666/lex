/**
 * @file
 * @source ./lib/lex-variables/index.js
 * @description States from de module
 */

export const lexVariables = {
	counter : 0,
	/**@type {Array<() =>any>}*/
	clientStack : [],
	/**@type {"select"|"create"|"build"}*/
	mode : "select",
};
