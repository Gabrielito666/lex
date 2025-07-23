const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const lex_test = path.resolve(__dirname, "lex.test.js");
const index_test = path.resolve(__dirname, "index.test.html");

const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!--<div lexid="3">
        <h1 lexid="1"><span lexid="0">numero: </span>0</h1>
        <button lexid="2">Incrementar</button>
    </div>-->
</body>
<JAVASCRIPT_PLACEHOLDER>
</html>
`;

esbuild.build({
    entryPoints: [lex_test],
    write: false,
    bundle: true,
    minify: false,
    sourcemap: false,
    target: "es2015",
    format: "esm",
    jsx: "transform",
    jsxFactory: "Lex.createElement",
    jsxFragment: "Lex.Fragment",
    loader: { '.js': 'jsx' },
}).then((result) => {
    const bundle_content = result.outputFiles[0].text;
    const new_index_test_content = baseHTML.replace("<JAVASCRIPT_PLACEHOLDER>", `<script type="module">${bundle_content}</script>`);
    fs.writeFileSync(index_test, new_index_test_content);
    
    console.log("test is build, open test/index.test.html");
}).catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
});