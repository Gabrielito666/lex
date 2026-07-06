const buildJsx = require("#build-lib/build-jsx");
const buildHTML = require("#build-lib/build-html");
const path = require("path");
const fs = require("fs").promises;

const isHtml = process.argv.includes("--html");

const main = async() =>
{
if(isHtml)
{
	const infile = path.resolve(process.cwd(), "test-lab/index.jsx");
	const outfile = path.resolve(process.cwd(), "test-lab/output.html");
	const out = await buildHTML.standart(infile, { minify: false });
	if(out.error) throw out.error;

	await fs.writeFile(outfile, out.htmlText);
}
else
{
	const infile = path.resolve(process.cwd(), "test-lab/index.jsx");
	const outfile = path.resolve(process.cwd(), "test-lab/output.js");
	const out = await buildJsx.standart(infile, { minify: false });

	if(out.error) throw out.error;
	await fs.writeFile(outfile, out.bundle.text);
}
}
main();
