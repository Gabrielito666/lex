/**
 * @typedef {import("./types").BuilderTemplates} BuilderTemplates
*/
/**@type {BuilderTemplates}*/
const builderTemplates =
{
    standart(pageJsx){
        return`import "${pageJsx}";`
    },
    layout(layoutJsx, pageJsx)
    {
        return `import Lex from "@lek-js/lex";
        import Page from "${pageJsx}";
        import Layout from "${layoutJsx}";

        Lex.mount(<Layout><Page/></Layout>);
    `;
    }
}

module.exports = builderTemplates;