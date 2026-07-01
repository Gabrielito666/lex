const { JSDOM } = require("jsdom");
const esbuild = require("esbuild");
const buildJSX = require("#build-lib/build-jsx");
const buildHTMLTemplates = require("#build-lib/builder-templates");
const path = require("path");
const loaders = require("#build-lib/loaders");

/**
 * @import {BuildOptions} from "#build-lib/build-jsx";
 * @import {OutputFile} from "esbuild";
 * @typedef {{
 *	htmlText: string;
 *	assets: OutputFile[];
 * }} BuildHTMLOutput
 */

/**
 * @param {string} stringCode
 * @param {string} resolveDir
 * @param {boolean} [minify]
 * @returns {Promise<string>}
 */
const buildCodeToBuild = async(stringCode, resolveDir, minify) =>
{
	const out = await esbuild.build({
		stdin: {
			contents: stringCode,
			resolveDir,
			loader: "jsx"
		},
		bundle: true,
		minify, //importante para no romper los css.modules
		platform: "browser",
		jsxFactory: "Lex.createElement",
		jsxFragment: "Lex.Fragment",
		write: false,
		outfile: "lex-code-to-build.js",
		assetNames: "./lex-assets/[name]-[hash]",
		plugins: [{
			name: 'replace-module',
			setup(build) {
				build.onResolve({ filter: /^@lek-js\/lex$/ }, args =>
				{
					return { path: require.resolve("#build-lib/builder-lex-lib") };
				});
			}
		}],
		loader: loaders
	});

	if(out.errors.length > 0) throw out.errors[0];

	const codeFile = out.outputFiles.find(file => path.basename(file.path) === "lex-code-to-build.js");

	if(!codeFile) throw new Error("An unexpected error has occurred. The main bundle file was not found.");

	return codeFile.text;
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildHTMLOutput>}
 */
const buildHTML = async(pageJsx, options) =>
{
    return await buildHTML.standart(pageJsx, options);
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildHTMLOutput>}
 */
buildHTML.standart = async(pageJsx, options) =>
{
    const stringCode = buildHTMLTemplates.standart(pageJsx);
    return await buildHTML.byStringCode(stringCode, path.dirname(pageJsx), options);
}
/**
 * @param {string} layoutJsx
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<BuildHTMLOutput>}
 */
buildHTML.layout = async(layoutJsx, pageJsx, options) =>
{
    const stringCode = buildHTMLTemplates.layout(layoutJsx, pageJsx);
    return await buildHTML.byStringCode(stringCode, path.dirname(pageJsx), options);
}

/**
 * @param {string} stringCode
 * @param {string} resolveDir
 * @param {BuildOptions} options
 * @returns {Promise<BuildHTMLOutput>}
 */
buildHTML.byStringCode = async(stringCode, resolveDir, options) =>
{
	const optionsToBuild = {...options, write: false}; // write: false is important method return a string
	const outputFiles = await buildJSX.byStringCode(stringCode, resolveDir, optionsToBuild);

	const bundleJS = outputFiles.bundle;
	const cssFile = outputFiles.css;

	const dom = new JSDOM("", { runScripts: "dangerously", resources: "usable" });
	dom.window.EventTarget.prototype.addEventListener = () => {};
	dom.window.EventTarget.prototype.dispatchEvent = () => true;
	dom.window.EventTarget.prototype.removeEventListener = () => {};

	const codeToBuild = await buildCodeToBuild(stringCode, resolveDir, options.minify);

	dom.window.eval(codeToBuild);

	const headElement = dom.window.document.querySelector("head[lex_root]");
	if(cssFile)
	{
		const styleElement = dom.window.document.createElement("style");
		styleElement.innerHTML = cssFile.text;
		headElement?.appendChild(styleElement);
	};

	const scriptElement = dom.window.document.createElement("script");
	scriptElement.innerHTML = bundleJS.text;
	scriptElement.type = "module";
  
	if(!headElement) throw new Error("Error compiling with buildHTML. We tried to find the head element but couldn't locate it. Please report the error.");

	headElement.appendChild(scriptElement);

	const htmlElement = dom.window.document.querySelector("html[lex_root]");
	if(!htmlElement) throw new Error("Error compiling with buildHTML. We tried to find the html element but couldn't locate it. Please report the error.");

	htmlElement.removeAttribute("lex_root");
	headElement.removeAttribute("lex_root");

	const html = htmlElement.outerHTML;

	return { htmlText: html, assets: outputFiles.assets };
}

module.exports = buildHTML;
