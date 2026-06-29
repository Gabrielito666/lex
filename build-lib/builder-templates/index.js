/**
 * @param {string} pageJsx
 * @returns {string}
 */
const standart = (pageJsx) => `import "${pageJsx}";`;

/**
 * @param {string} layoutJsx
 * @param {string} pageJsx
 * @returns {string}
 */
const layout = (layoutJsx, pageJsx) =>
`import Lex from "@lek-js/lex";
import Page from "${pageJsx}";
import Layout from "${layoutJsx}";

Lex.mount(<Layout><Page/></Layout>);
`;

module.exports = { standart, layout };
