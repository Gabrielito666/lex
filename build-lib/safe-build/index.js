/**
 * @file
 * @source ./build-lib/safe-build/index.js
 * @description Wraper from esbuild.build() with consistent output
 */

const esbuild = require("esbuild");

/**
 * @import {BuildOptions, BuildFailure, BuildResult, SameShape} from "esbuild";
 */

/**
 * @param {any|Error|BuildFailure} err
 * @returns {Error|BuildFailure}
 */
const __catch = (err) =>
{
	if(err instanceof Error) return err;

	return new Error(String(err));
}

/**
 * @template {BuildOptions}Ops
 * @param {Ops} buildOptions
 * @returns {Promise<{result: BuildResult<Ops>; error: null}|{result:null; error: Error|BuildFailure}>}
 */
const safeBuild = async (buildOptions) =>
{
	try
	{
		const out = await esbuild.build(/**@type {BuildOptions}*/(buildOptions));
		return { result: out, error: null }
	}
	catch(err)
	{
		return {
			result: null,
			error: __catch(err)
		}
	}
}

module.exports = safeBuild;
