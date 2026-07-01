const esbuild = require("esbuild");
const path = require("path");
const buildHTMLTemplates = require("#build-lib/builder-templates");
const loaders = require("#build-lib/loaders");

/**
 * @import {OutputFile} from "esbuild";
 *
 * @typedef {{
 *	minify?: boolean,
 * }} BuildOptions
 * @typedef {{
 * 	bundle: OutputFile;
 * 	css?: OutputFile;
 * 	assets: OutputFile[];
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
		assetNames: "assets/[name]-[hash].[ext]",
		loader: loaders
	});

	if(out.errors.length > 0) throw out.errors[0];

	const bundle = out.outputFiles.find(file => path.basename(file.path) === "lex-bundle.js");
	if(!bundle) throw new Error("An unexpected error has occurred. The main bundle file was not found.");

	const css = out.outputFiles.find(file => file.path.endsWith(".css"));
	const assets = out.outputFiles.filter(file => (file !== bundle && file !== css));
	
	return { bundle, css, assets };
}

module.exports = buildJSX;
