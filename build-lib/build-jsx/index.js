const path = require("path");
const buildHTMLTemplates = require("#build-lib/builder-templates");
const loaders = require("#build-lib/loaders");
const safeBuild = require("#build-lib/safe-build");

/**
 * @import {OutputFile, BuildFailure, Message} from "esbuild";
 *
 * @typedef {{
 *	minify?: boolean,
 * }} BuildOptions
 * @typedef {{
 * 	bundle: OutputFile;
 * 	css?: OutputFile;
 * 	assets: OutputFile[];
 * 	error: null;
 * 	warnings: Message[];
 * }|{
 *	bundle: null;
 *	css: null;
 *	assets: null;
 *	error: BuildFailure|Error;
 * }} BuildOutput
 */

/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildOutput>}
 */
const buildJSX = (pageJsx, options={}) =>
{
    return buildJSX.standart(pageJsx, options);
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildOutput>}
 */
buildJSX.standart = async(pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.standart(pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
}
/**
 * @param {string} layoutJsx
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildOutput>}
 */
buildJSX.layout = async(layoutJsx, pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.layout(layoutJsx, pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
};

/**
 * @param {string} stringCode
 * @param {string} resolveDir
 * @param {BuildOptions} options
 * @returns {Promise<BuildOutput>}
 */
buildJSX.byStringCode = async(stringCode, resolveDir, options={}) =>
{
	const safeResult = await safeBuild({
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
		publicPath: "/",
		assetNames: "__assets/[name]-[hash]",
		loader: loaders
	});

	if(safeResult.error)
	{
		return {
			error: safeResult.error,
			bundle: null,
			css: null,
			assets: null
		};
	}

	const out = safeResult.result;

	const bundle = out.outputFiles.find(file => path.basename(file.path) === "lex-bundle.js");
	if(!bundle) throw new Error("An unexpected error has occurred. The main bundle file was not found.");

	const css = out.outputFiles.find(file => file.path.endsWith(".css"));
	const assets = out.outputFiles.filter(file => (file !== bundle && file !== css));
	
	return { bundle, css, assets, error: null, warnings: out.warnings };
}

module.exports = buildJSX;
