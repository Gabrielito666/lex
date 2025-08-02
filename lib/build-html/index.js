const { JSDOM } = require("jsdom");
const buildJSX = require("../build-jsx");
const esbuild = require("esbuild");
const buildHTMLTemplates = require("../builder-templates");
const path = require("path");

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

    if(out.errors) throw out.errors[0];

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
    const codeToClient = await buildJSX.byStringCode(stringCode, resolveDir, options);
    const codeToBuild = await buildCodeToBuild(stringCode, resolveDir);

    const dom = new JSDOM("", { runScripts: "dangerously", resources: "usable" });
  
    dom.window.eval(codeToBuild);
  
    const scriptElement = dom.window.document.createElement("script");
    scriptElement.innerHTML = codeToClient;
    scriptElement.type = "module";
  
    dom.window.document.querySelector("head[lexid]").appendChild(scriptElement);
    
    const html = dom.window.document.querySelector("html[lexid]").outerHTML;

    return html;
}
module.exports = buildHTML;