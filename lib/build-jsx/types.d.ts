import { BuildOptions } from "esbuild"
interface LexJstBuildOptions
{
    minify: BuildOptions["minify"];
    write: BuildOptions["write"];
    outfile: BuildOptions["outfile"];
}

export interface LexBuildJSX
{
    (pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    standart(pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    layout(layoutJSX:string, pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    byStringCode(stringCode:string, resolveDir:string, options?:LexJstBuildOptions):Promise<string | undefined>;
}