const esbuild = require("esbuild");
const path = require("path");
const buildHTMLTemplates = require("#build-lib/builder-templates");

/**
 * @import {OutputFile} from "esbuild";
 *
 * @typedef {{
 *	minify?: boolean,
 * }} Options
 */

/**
 * @param {string} pageJsx
 * @param {Options} options
 * @returns {Promise<OutputFile[]>}
 */
const buildJSX = (pageJsx, options={}) =>
{
    return buildJSX.standart(pageJsx, options);
}
/**
 * @param {string} pageJsx
 * @param {Options} options
 * @returns {Promise<OutputFile[]>}
 */
buildJSX.standart = async(pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.standart(pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
}
/**
 * @param {string} layoutJsx
 * @param {string} pageJsx
 * @param {Options} options
 * @returns {Promise<OutputFile[]>}
 */
buildJSX.layout = async(layoutJsx, pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.layout(layoutJsx, pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
};

/**
 * @param {string} stringCode
 * @param {string} resolveDir
 * @param {Options} options
 * @returns {Promise<OutputFile[]>}
 */
buildJSX.byStringCode = async(stringCode, resolveDir, options={}) =>
{
	const out = await esbuild.build
	({
		stdin:
		{
			contents: stringCode,
			resolveDir,
			loader: "jsx"
		},
		bundle: true,
		minify: options.minify,
		platform: "browser",
		jsxFactory: "Lex.createElement",
		jsxFragment: "Lex.Fragment",
		write: false,
		outfile: "lex-bundle.js",
		loader: {
			".css": "css"
		}
	});

	if(out.errors.length > 0) throw out.errors[0];
	if(out.outputFiles.length < 1) throw new Error("An unexpected error has occurred. There are no output files to return.");

	return out.outputFiles;
}

module.exports = buildJSX;
