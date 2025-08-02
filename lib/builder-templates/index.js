/**
 * @typedef {import("./types").BuilderTemplates} BuilderTemplates
*/
/**@type {BuilderTemplates}*/
const builderTemplates =
{
    standart(pageJsx){
        return`import * from "${pageJsx}";`
    },
    layout(layoutJsx, pageJsx)
    {
        return `import Lex from "@lek-js/lex";
        import Page from "${pageJsx}";
        import Layout from "${layoutJsx}";

        const main = <Layout><Page/></Layout>;

        if(!document.contains(main)) document.documentElement.appendChild(main);
        Lex.startClient();
    `;
    }
}

module.exports = builderTemplates;