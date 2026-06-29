const esbuild = require("esbuild");
const path = require("path");
const buildHTMLTemplates = require("#build-lib/builder-templates");

/**
 * @import {BuildOptions} "esbuild";
 */

/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<string|undefined>}
 */
const buildJSX = (pageJsx, options={}) =>
{
    return buildJSX.standart(pageJsx, options);
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<string|undefined>}
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
 * @returns {Promise<string|undefined>}
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
 * @returns {Promise<string|undefined>}
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
		minify: true,
		platform: "browser",
		jsxFactory: "Lex.createElement",
		jsxFragment: "Lex.Fragment",
		write: false,
		...options
	});

	if(out.errors.length > 0) throw out.errors[0];

	if(options.write) return undefined;

	if(out.outputFiles && out.outputFiles[0]) return out.outputFiles[0].text;

	return undefined;
}

module.exports = buildJSX;
