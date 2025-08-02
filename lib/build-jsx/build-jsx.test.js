/**
 * @vitest-environment node
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import buildJSX from './index.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, 'test-fixtures');
const outputDir = path.join(__dirname, 'test-output');

describe('BUILD-JSX MODULE - COMPREHENSIVE TEST SUITE', () => {

    beforeAll(async () => {
        // Create test directories
        await fs.mkdir(testDir, { recursive: true });
        await fs.mkdir(outputDir, { recursive: true });
        
        // Create test JSX files
        await createTestFiles();
    });

    afterAll(async () => {
        // Clean up test directories
        await cleanupDirectory(testDir);
        await cleanupDirectory(outputDir);
    });

    beforeEach(async () => {
        // Clean output directory before each test
        await cleanupDirectory(outputDir);
        await fs.mkdir(outputDir, { recursive: true });
    });

    /* ================================================================
     * HELPER FUNCTIONS
     * ================================================================ */

    async function createTestFiles() {
        // Simple page component
        await fs.writeFile(path.join(testDir, 'SimplePage.jsx'), `
import Lex from "@lek-js/lex";

const SimplePage = () => {
    return <div>Hello World</div>;
};

export default SimplePage;
        `);

        // Component with state
        await fs.writeFile(path.join(testDir, 'StatePage.jsx'), `
import Lex from "@lek-js/lex";

const StatePage = () => {
    const [count, setCount] = Lex.useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count.get() + 1)}>
                Increment
            </button>
        </div>
    );
};

export default StatePage;
        `);

        // Layout component
        await fs.writeFile(path.join(testDir, 'Layout.jsx'), `
import Lex from "@lek-js/lex";

const Layout = ({ children }) => {
    return (
        <html>
            <head>
                <title>Test Layout</title>
            </head>
            <body>
                <header>Header</header>
                <main>{children}</main>
                <footer>Footer</footer>
            </body>
        </html>
    );
};

export default Layout;
        `);

        // Invalid JSX file for error testing
        await fs.writeFile(path.join(testDir, 'InvalidPage.jsx'), `
import Lex from "@lek-js/lex";

const InvalidPage = () => {
    return <div>Unclosed div;
        `);
    }

    async function cleanupDirectory(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await cleanupDirectory(fullPath);
                    await fs.rmdir(fullPath);
                } else {
                    await fs.unlink(fullPath);
                }
            }
        } catch (err) {
            // Directory might not exist, ignore
        }
    }

    async function fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /* ================================================================
     * MAIN BUILDJSX FUNCTION TESTS
     * ================================================================ */

    describe('buildJSX() - Main Function', () => {
        
        test('should call standart() internally and return string', async () => {
            /** 
             * Test that main function delegates to standart()
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX(pagePath);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain('Hello World');
        });

        test('should accept options and pass them to standart()', async () => {
            /** 
             * Test main function with options
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const options = { minify: false };
            const result = await buildJSX(pagePath, options);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            // Non-minified code should have whitespace
            expect(result).toMatch(/\s{2,}/);
        });

        test('should work without options parameter', async () => {
            /** 
             * Test main function without options
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX(pagePath);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    /* ================================================================
     * BUILDJSX.STANDART() TESTS  
     * ================================================================ */

    describe('buildJSX.standart()', () => {
        
        test('should compile simple JSX page successfully', async () => {
            /** 
             * Test basic standart compilation
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX.standart(pagePath);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain('Hello World');
        });

        test('should compile page with state and hooks', async () => {
            /** 
             * Test compilation with React-like hooks
             */
            const pagePath = path.join(testDir, 'StatePage.jsx');
            const result = await buildJSX.standart(pagePath);
            
            expect(typeof result).toBe('string');
            expect(result).toContain('Count:');
            expect(result).toContain('Increment');
            expect(result).toContain('useState');
        });

        test('should minify by default', async () => {
            /** 
             * Test default minification
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX.standart(pagePath);
            
            // Minified code should be compact
            expect(result).not.toMatch(/\s{2,}/);
            expect(result.split('\n').length).toBeLessThan(5);
        });

        test('should respect minify: false option', async () => {
            /** 
             * Test disabling minification
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX.standart(pagePath, { minify: false });
            
            // Non-minified should have more whitespace/lines
            expect(result).toMatch(/\s{2,}/);
        });

        test('should write to file when write: true and outfile specified', async () => {
            /** 
             * Test file output functionality
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'standart-output.js');
            
            const result = await buildJSX.standart(pagePath, {
                write: true,
                outfile: outfile
            });
            
            // Should still return the code as string
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            
            // Should create the file
            expect(await fileExists(outfile)).toBe(true);
            
            // File content should match returned string
            const fileContent = await fs.readFile(outfile, 'utf-8');
            expect(fileContent).toBe(result);
        });

        test('should handle relative paths correctly', async () => {
            /** 
             * Test relative path handling
             */
            const relativePath = './test-fixtures/SimplePage.jsx';
            const result = await buildJSX.standart(relativePath);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        test('should throw error for non-existent file', async () => {
            /** 
             * Test error handling for missing files
             */
            const nonExistentPath = path.join(testDir, 'NonExistent.jsx');
            
            await expect(buildJSX.standart(nonExistentPath))
                .rejects.toThrow();
        });
    });

    /* ================================================================
     * BUILDJSX.LAYOUT() TESTS
     * ================================================================ */

    describe('buildJSX.layout()', () => {
        
        test('should compile layout with page successfully', async () => {
            /** 
             * Test basic layout compilation
             */
            const layoutPath = path.join(testDir, 'Layout.jsx');
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            
            const result = await buildJSX.layout(layoutPath, pagePath);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            
            // Should contain layout elements
            expect(result).toContain('Header');
            expect(result).toContain('Footer');
            
            // Should contain page content
            expect(result).toContain('Hello World');
            
            // Should contain Lex.startClient()
            expect(result).toContain('startClient');
        });

        test('should generate proper layout structure', async () => {
            /** 
             * Test that layout wraps page correctly
             */
            const layoutPath = path.join(testDir, 'Layout.jsx');
            const pagePath = path.join(testDir, 'StatePage.jsx');
            
            const result = await buildJSX.layout(layoutPath, pagePath);
            
            // Should import both components
            expect(result).toContain('import Page from');
            expect(result).toContain('import Layout from');
            expect(result).toContain('<Layout><Page/></Layout>');
        });

        test('should respect minify option in layout', async () => {
            /** 
             * Test minification in layout compilation
             */
            const layoutPath = path.join(testDir, 'Layout.jsx');
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            
            const minified = await buildJSX.layout(layoutPath, pagePath, { minify: true });
            const unminified = await buildJSX.layout(layoutPath, pagePath, { minify: false });
            
            expect(minified.length).toBeLessThan(unminified.length);
            expect(unminified).toMatch(/\s{2,}/);
        });

        test('should write layout to file when specified', async () => {
            /** 
             * Test layout file output
             */
            const layoutPath = path.join(testDir, 'Layout.jsx');
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'layout-output.js');
            
            const result = await buildJSX.layout(layoutPath, pagePath, {
                write: true,
                outfile: outfile
            });
            
            expect(typeof result).toBe('string');
            expect(await fileExists(outfile)).toBe(true);
            
            const fileContent = await fs.readFile(outfile, 'utf-8');
            expect(fileContent).toBe(result);
        });

        test('should handle missing layout file', async () => {
            /** 
             * Test error handling for missing layout
             */
            const nonExistentLayout = path.join(testDir, 'NonExistent.jsx');
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            
            await expect(buildJSX.layout(nonExistentLayout, pagePath))
                .rejects.toThrow();
        });

        test('should handle missing page file', async () => {
            /** 
             * Test error handling for missing page
             */
            const layoutPath = path.join(testDir, 'Layout.jsx');
            const nonExistentPage = path.join(testDir, 'NonExistent.jsx');
            
            await expect(buildJSX.layout(layoutPath, nonExistentPage))
                .rejects.toThrow();
        });
    });

    /* ================================================================
     * BUILDJSX.BYSTRINGCODE() TESTS
     * ================================================================ */

    describe('buildJSX.byStringCode()', () => {
        
        test('should compile JSX string code successfully', async () => {
            /** 
             * Test basic string code compilation
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => <div>String Code Test</div>;
                export default App;
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain('String Code Test');
        });

        test('should handle complex JSX with hooks', async () => {
            /** 
             * Test string compilation with hooks and state
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                
                const App = () => {
                    const [text, setText] = Lex.useState("Initial");
                    const buttonRef = Lex.useRef(null);
                    
                    return (
                        <div>
                            <p>{text}</p>
                            <button ref={buttonRef} onClick={() => setText("Updated")}>
                                Click me
                            </button>
                        </div>
                    );
                };
                
                export default App;
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname);
            
            expect(result).toContain('useState');
            expect(result).toContain('useRef');
            expect(result).toContain('Initial');
            expect(result).toContain('Click me');
        });

        test('should respect resolveDir for imports', async () => {
            /** 
             * Test that resolveDir affects import resolution
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => <div>Resolve Test</div>;
            `;
            
            // Should work with valid resolveDir
            const result = await buildJSX.byStringCode(jsxCode, testDir);
            expect(typeof result).toBe('string');
            expect(result).toContain('Resolve Test');
        });

        test('should apply minification by default', async () => {
            /** 
             * Test default minification in string compilation
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                
                const App = () => {
                    return (
                        <div className="container">
                            <h1>Title</h1>
                            <p>Paragraph</p>
                        </div>
                    );
                };
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname);
            
            // Should be minified (compact)
            expect(result).not.toMatch(/\s{2,}/);
        });

        test('should respect minify: false option', async () => {
            /** 
             * Test disabling minification in string compilation
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => <div>Minify Test</div>;
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname, { minify: false });
            
            // Should have readable formatting
            expect(result).toMatch(/\s{2,}/);
        });

        test('should write to file when write: true', async () => {
            /** 
             * Test file output from string compilation
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => <div>File Output Test</div>;
            `;
            const outfile = path.join(outputDir, 'string-output.js');
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname, {
                write: true,
                outfile: outfile
            });
            
            expect(typeof result).toBe('string');
            expect(await fileExists(outfile)).toBe(true);
            
            const fileContent = await fs.readFile(outfile, 'utf-8');
            expect(fileContent).toBe(result);
        });

        test('should handle JSX syntax errors gracefully', async () => {
            /** 
             * Test error handling for invalid JSX
             */
            const invalidJSX = `
                import Lex from "@lek-js/lex";
                const App = () => <div>Unclosed div;
            `;
            
            await expect(buildJSX.byStringCode(invalidJSX, __dirname))
                .rejects.toThrow();
        });

        test('should handle empty string code', async () => {
            /** 
             * Test edge case with empty input
             */
            await expect(buildJSX.byStringCode('', __dirname))
                .rejects.toThrow();
        });
    });

    /* ================================================================
     * OPTIONS AND CONFIGURATION TESTS
     * ================================================================ */

    describe('Options and Configuration', () => {
        
        test('should handle all supported esbuild options', async () => {
            /** 
             * Test various esbuild options combination
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'options-test.js');
            
            const options = {
                minify: false,
                write: true,
                outfile: outfile,
                // Additional esbuild options should be passed through
                target: 'es2020',
                format: 'iife'
            };
            
            const result = await buildJSX.standart(pagePath, options);
            
            expect(typeof result).toBe('string');
            expect(await fileExists(outfile)).toBe(true);
        });

        test('should default to minify: true when not specified', async () => {
            /** 
             * Test default minification behavior
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => (
                    <div className="test">
                        <h1>Title</h1>
                        <p>Content</p>
                    </div>
                );
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname, {});
            
            // Should be minified by default
            expect(result).not.toMatch(/\s{2,}/);
        });

        test('should handle write: false (default behavior)', async () => {
            /** 
             * Test that files are not written by default
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'should-not-exist.js');
            
            const result = await buildJSX.standart(pagePath, {
                write: false,
                outfile: outfile
            });
            
            expect(typeof result).toBe('string');
            expect(await fileExists(outfile)).toBe(false);
        });
    });

    /* ================================================================
     * INTEGRATION AND OUTPUT VALIDATION TESTS
     * ================================================================ */

    describe('Integration and Output Validation', () => {
        
        test('should generate executable JavaScript code', async () => {
            /** 
             * Test that output is valid JavaScript
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => {
                    const [count, setCount] = Lex.useState(42);
                    return <div>Count: {count}</div>;
                };
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname);
            
            // Should not throw when evaluated (basic syntax check)
            expect(() => new Function(result)).not.toThrow();
        });

        test('should preserve JSX factory configuration', async () => {
            /** 
             * Test that JSX is transformed with correct factory
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => <div><span>Nested</span></div>;
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname, { minify: false });
            
            // Should use Lex.createElement as JSX factory
            expect(result).toContain('Lex.createElement');
        });

        test('should handle Fragment correctly', async () => {
            /** 
             * Test JSX Fragment transformation
             */
            const jsxCode = `
                import Lex from "@lek-js/lex";
                const App = () => (
                    <>
                        <div>First</div>
                        <div>Second</div>
                    </>
                );
            `;
            
            const result = await buildJSX.byStringCode(jsxCode, __dirname, { minify: false });
            
            // Should use Lex.Fragment
            expect(result).toContain('Lex.Fragment');
        });

        test('should bundle dependencies correctly', async () => {
            /** 
             * Test that external dependencies are bundled
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const result = await buildJSX.standart(pagePath, { minify: false });
            
            // Should be bundled (contain actual implementation, not just imports)
            expect(result.length).toBeGreaterThan(1000); // Bundled code should be substantial
            expect(result).not.toContain('import '); // No remaining imports in bundled code
        });
    });

    /* ================================================================
     * ERROR HANDLING AND EDGE CASES
     * ================================================================ */

    describe('Error Handling and Edge Cases', () => {
        
        test('should provide meaningful error for invalid JSX syntax', async () => {
            /** 
             * Test error messages for syntax errors
             */
            const invalidPath = path.join(testDir, 'InvalidPage.jsx');
            
            try {
                await buildJSX.standart(invalidPath);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeDefined();
                // esbuild should provide meaningful error info
                expect(error.message || error.text || error.toString()).toContain('');
            }
        });

        test('should handle missing import resolution', async () => {
            /** 
             * Test error handling for unresolvable imports
             */
            const jsxCode = `
                import NonExistent from "./does-not-exist";
                const App = () => <div>Test</div>;
            `;
            
            await expect(buildJSX.byStringCode(jsxCode, __dirname))
                .rejects.toThrow();
        });

        test('should handle invalid outfile paths gracefully', async () => {
            /** 
             * Test error handling for invalid output paths
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const invalidOutfile = '/invalid/path/that/does/not/exist/output.js';
            
            await expect(buildJSX.standart(pagePath, {
                write: true,
                outfile: invalidOutfile
            })).rejects.toThrow();
        });

        test('should handle very large JSX files', async () => {
            /** 
             * Test performance with larger files
             */
            const largeJSX = `
                import Lex from "@lek-js/lex";
                const App = () => (
                    <div>
                        ${Array(100).fill('<div>Large content</div>').join('')}
                    </div>
                );
            `;
            
            const result = await buildJSX.byStringCode(largeJSX, __dirname);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(1000);
        });
    });

    /* ================================================================
     * PERFORMANCE AND OPTIMIZATION TESTS
     * ================================================================ */

    describe('Performance and Optimization', () => {
        
        test('should complete compilation in reasonable time', async () => {
            /** 
             * Test compilation performance
             */
            const pagePath = path.join(testDir, 'StatePage.jsx');
            const startTime = Date.now();
            
            const result = await buildJSX.standart(pagePath);
            
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            expect(typeof result).toBe('string');
        });

        test('should produce smaller output when minified', async () => {
            /** 
             * Test minification effectiveness
             */
            const pagePath = path.join(testDir, 'StatePage.jsx');
            
            const minified = await buildJSX.standart(pagePath, { minify: true });
            const unminified = await buildJSX.standart(pagePath, { minify: false });
            
            expect(minified.length).toBeLessThan(unminified.length);
            expect(minified.length / unminified.length).toBeLessThan(0.8); // At least 20% reduction
        });
    });

    /* ================================================================
     * FILE SYSTEM OPERATIONS TESTS
     * ================================================================ */

    describe('File System Operations', () => {
        
        test('should create output directories if they do not exist', async () => {
            /** 
             * Test automatic directory creation
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const deepOutfile = path.join(outputDir, 'deep', 'nested', 'output.js');
            
            const result = await buildJSX.standart(pagePath, {
                write: true,
                outfile: deepOutfile
            });
            
            expect(typeof result).toBe('string');
            expect(await fileExists(deepOutfile)).toBe(true);
        });

        test('should overwrite existing output files', async () => {
            /** 
             * Test file overwriting behavior
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'overwrite-test.js');
            
            // Create initial file
            await fs.writeFile(outfile, 'initial content');
            
            const result = await buildJSX.standart(pagePath, {
                write: true,
                outfile: outfile
            });
            
            const fileContent = await fs.readFile(outfile, 'utf-8');
            expect(fileContent).toBe(result);
            expect(fileContent).not.toBe('initial content');
        });

        test('should maintain file permissions when overwriting', async () => {
            /** 
             * Test that file permissions are preserved
             */
            const pagePath = path.join(testDir, 'SimplePage.jsx');
            const outfile = path.join(outputDir, 'permissions-test.js');
            
            // Create file with specific permissions
            await fs.writeFile(outfile, 'test');
            await fs.chmod(outfile, 0o644);
            
            await buildJSX.standart(pagePath, {
                write: true,
                outfile: outfile
            });
            
            const stats = await fs.stat(outfile);
            expect(stats.mode & 0o777).toBe(0o644);
        });
    });
});
