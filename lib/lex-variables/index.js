/**
 * @file
 * @source ./lib/lex-variables/index.js
 * @description States from de module
 */

import UseClientHandler from "#lib/use-client-handler";

export const lexVariables = {
	counter : 0,
	clientStack : new UseClientHandler(),
	/**@type {"select"|"create"|"build"}*/
	mode : "select",
};
