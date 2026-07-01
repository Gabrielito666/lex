const { JSDOM } = require("jsdom");
const esbuild = require("esbuild");
const buildJSX = require("#build-lib/build-jsx");
const buildHTMLTemplates = require("#build-lib/builder-templates");
const path = require("path");
const fs = require("fs").promises;

/**
 * @import {BuildOptions} from "esbuild";
 */

/**
 * @param {string} stringCode
 * @param {string} resolveDir
 * @returns {Promise<string>}
 */
const buildCodeToBuild = async(stringCode, resolveDir) =>
{
	const out = await esbuild.build({
		stdin: {
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
		outfile: "lex-code-to-build",
		plugins: [{
			name: 'replace-module',
			setup(build) {
				build.onResolve({ filter: /^@lek-js\/lex$/ }, args =>
				{
					return { path: require.resolve("#build-lib/builder-lex-lib") };
				});
			}
		}],
		loader: {
			".css": "css"
		}
	});

	if(out.errors.length > 0) throw out.errors[0];

	const codeFile = out.outputFiles.find(file => path.basename(file.path) === "lex-code-to-build");

	if(!codeFile) throw new Error("An unexpected error has occurred. The main bundle file was not found.");

	return codeFile.text;
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<string|undefined>}
 */
const buildHTML = async(pageJsx, options) =>
{
    return await buildHTML.standart(pageJsx, options);
}
/**
 * @param {string} pageJsx
 * @param {BuildOptions} options
 * @returns {Promise<string|undefined>}
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
 * @returns {Promise<string|undefined>}
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
 * @returns {Promise<string|undefined>}
 */
buildHTML.byStringCode = async(stringCode, resolveDir, options) =>
{
	const optionsToBuild = {...options, write: false}; // write: false is important method return a string
	const outputFiles = await buildJSX.byStringCode(stringCode, resolveDir, optionsToBuild);

	const bundleJS = outputFiles.find(file => path.basename(file.path) === "lex-bundle.js");
	if(!bundleJS) throw new Error("An unexpected error has occurred. The main bundle file was not found.");

	const cssFiles = outputFiles.filter(file => file.path.endsWith(".css"));

	const dom = new JSDOM("", { runScripts: "dangerously", resources: "usable" });
	dom.window.EventTarget.prototype.addEventListener = () => {};
	dom.window.EventTarget.prototype.dispatchEvent = () => true;
	dom.window.EventTarget.prototype.removeEventListener = () => {};

	const codeToBuild = await buildCodeToBuild(stringCode, resolveDir);
	dom.window.eval(codeToBuild);

	const headElement = dom.window.document.querySelector("head[lexid]");
	cssFiles.forEach(file =>
	{
		const styleElement = dom.window.document.createElement("style");
		styleElement.innerHTML = file.text;
		headElement?.appendChild(styleElement);
	});

	const scriptElement = dom.window.document.createElement("script");
	scriptElement.innerHTML = bundleJS.text;
	scriptElement.type = "module";
  
	if(!headElement) throw new Error("Error compiling with buildHTML. We tried to find the head element but couldn't locate it. Please report the error.");

	headElement.appendChild(scriptElement);

	const htmlElement = dom.window.document.querySelector("html[lexid]");
	if(!htmlElement) throw new Error("Error compiling with buildHTML. We tried to find the html element but couldn't locate it. Please report the error.");

	const html = htmlElement.outerHTML;

	if(options.write)
	{
		if(!options.outfile) throw new Error("Error in buildHTML. If you use `write: true`, you must set an `outfile`.");
		await fs.writeFile(options.outfile, html);
	}

	return options.write ? undefined : html;
}
module.exports = buildHTML;
