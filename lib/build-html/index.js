const { JSDOM } = require("jsdom");
const buildJSX = require("../build-jsx");
const esbuild = require("esbuild");
const buildHTMLTemplates = require("../builder-templates");
const path = require("path");
const fs = require("fs").promises;
/**
 * @typedef {import("./types").LexBuildHTML} LexBuildHTML
*/


const buildCodeToBuild = async(stringCode, resolveDir) =>
{
    const out = await esbuild.build({
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
        plugins:
        [
            {
              name: 'replace-module',
              setup(build) {
                build.onResolve({ filter: /^@lek-js\/lex$/ }, args => {
                  return { path: require.resolve('../builder-lex-lib') };
                });
              }
            }
        ]
    });

    if(out.errors.length > 0) throw out.errors[0];

    return out.outputFiles[0].text;
}
/**@type {LexBuildHTML}*/
const buildHTML = (pageJsx, options) =>
{
    buildHTML.standart(pageJsx, options);
}

buildHTML.standart = async(pageJsx, options) =>
{
    const stringCode = buildHTMLTemplates.standart(pageJsx);
    return await buildHTML.byStringCode(stringCode, path.dirname(pageJsx), options);
}
buildHTML.layout = async(layoutJsx, pageJsx, options) =>
{
    const stringCode = buildHTMLTemplates.layout(layoutJsx, pageJsx);
    return await buildHTML.byStringCode(stringCode, path.dirname(pageJsx), options);
}

buildHTML.byStringCode = async(stringCode, resolveDir, options) =>
{
    const optionsToBuild = {...options, write: false}; // write: false is important method return a string
    const codeToClient = await buildJSX.byStringCode(stringCode, resolveDir, optionsToBuild);
    const codeToBuild = await buildCodeToBuild(stringCode, resolveDir);

    const dom = new JSDOM("", { runScripts: "dangerously", resources: "usable" });

    dom.window.eval(codeToBuild);

    const scriptElement = dom.window.document.createElement("script");
    scriptElement.innerHTML = codeToClient;
    scriptElement.type = "module";
  
    if(!dom.window.document.querySelector("head[lexid]"))
    {
        throw new Error("You must have a head in your code to use buildHTML");
    }
    dom.window.document.querySelector("head[lexid]").appendChild(scriptElement);

    const html = dom.window.document.querySelector("html[lexid]").outerHTML;

    if(options.write)
    {
        await fs.writeFile(options.outfile, html);
    }

    return options.write ? undefined : html;
}
module.exports = buildHTML;