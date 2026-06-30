const buildJsx = require("#build-lib/build-jsx");
const buildHTML = require("#build-lib/build-html");
const path = require("path");

const isHtml = process.argv.includes("--html");

if(isHtml)
{
	const infile = path.resolve(process.cwd(), "test-lab/index.jsx");
	const outfile = path.resolve(process.cwd(), "test-lab/output.html");
	buildHTML.standart(infile, { write: true, outfile, minify: false });
	
}
else
{
	const infile = path.resolve(process.cwd(), "test-lab/index.jsx");
	const outfile = path.resolve(process.cwd(), "test-lab/output.js");
	buildJsx.standart(infile, { write: true, outfile, minify: false });
}
