/**
 * @vitest-environment node
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const buildHTML = require('../index.js');

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, 'test-fixtures');
const outputDir = path.join(__dirname, 'test-output');

const pageJsx = path.join(testDir, 'page.jsx');
const layoutJsx = path.join(testDir, 'layout.jsx');
const stringCodePath = path.join(testDir, 'string-code.jsx');
const stringCode = fs.readFileSync(stringCodePath, 'utf8');

/**
 * hay que probar con write: true y write: false y con minify: true y minify: false
*/

describe('buildHTML', () => {
    const optionsA = {write: true, minify: true, outfile: path.join(outputDir, 'standart-minify-write.html')};
    const optionsB = {write: true, minify: false, outfile: path.join(outputDir, 'standart-no-minify-write.html')};
    const optionsC = {write: false, minify: true};
    const optionsD = {write: false, minify: false};

    const modes = ["standart", "layout", "byStringCode"];

    for(const mode of modes)
    {
        for(const options of [optionsA, optionsB, optionsC, optionsD])
        {
            test(`should build a page with ${mode} and ${options.write ? "write" : "no write"} and ${options.minify ? "minify" : "no minify"}`, async () => {
                if(mode === "standart")
                {
                    const result = await buildHTML.standart(stringCodePath, options);

                    if(options.write)
                    {
                        expect(fs.existsSync(options.outfile)).toBe(true);
                    }
                    else
                    {
                        expect(result).toBeDefined();
                    }
                }
                else if(mode === "layout")
                {
                    const result = await buildHTML.layout(layoutJsx, pageJsx, options);
                    if(options.write)
                    {
                        expect(fs.existsSync(options.outfile)).toBe(true);
                    }
                    else
                    {
                        expect(result).toBeDefined();
                    }
                }
                else if(mode === "byStringCode")
                {
                    const result = await buildHTML.byStringCode(stringCode, testDir, options);
                    if(options.write)
                    {
                        expect(fs.existsSync(options.outfile)).toBe(true);
                    }
                    else
                    {
                        expect(result).toBeDefined();
                    }
                }
            });
        }
    }
});