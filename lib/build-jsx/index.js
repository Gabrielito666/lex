const esbuild = require("esbuild");
const path = require("path");
const buildHTMLTemplates = require("../builder-templates");

/**
 * @typedef {import("./types").LexBuildJSX} LexBuildJSX
*/

/**@type {LexBuildJSX}*/
const buildJSX = (pageJsx, options={}) =>
{
    buildJSX.standart(pageJsx, options);
}

buildJSX.standart = async(pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.standart(pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
}

buildJSX.layout = async(layoutJsx, pageJsx, options={}) =>
{
    const stringCode = buildHTMLTemplates.layout(layoutJsx, pageJsx);
    return await buildJSX.byStringCode(stringCode, path.dirname(pageJsx), options);
};

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

    if(out.errors)
    {
        throw out.errors[0];
    }
    
    return out.outputFiles[0].text;
}

module.exports = buildJSX;