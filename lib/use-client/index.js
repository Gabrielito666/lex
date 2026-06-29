/**
 * @file
 * @source ./lib/use-client
 * @description Hook to includes code for just run-time and not build-time
 */

import {lexVariables} from "#lib/lex-variables";

/**
 * @param {() => any} handler
 * @returns void
 */
export const useClient = (handler) =>
{
	if(typeof handler !== "function") throw new Error("useClient only accepts functions");

	lexVariables.clientStack.push(handler);
}
