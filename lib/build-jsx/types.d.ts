import { BuildOptions } from "esbuild"
interface LexJstBuildOptions
{
    minify: BuildOptions["minify"];
    write: BuildOptions["write"];
    outfile: BuildOptions["outfile"];
}

export interface LexBuildJSX
{
    (pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    standart(pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    layout(layoutJSX:string, pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    byStringCode(stringCode:string, resolveDir:string, options?:LexJstBuildOptions):Promise<string>;
}