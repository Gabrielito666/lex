import { LexJstBuildOptions } from "../build-jsx/types";
export interface LexBuildHTML
{
    (pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    standart(pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    layout(layoutJSX:string, pageJSX:string, options?:LexJstBuildOptions):Promise<string | undefined>;
    byStringCode(stringCode:string, resolveDir:string, options?:LexJstBuildOptions):Promise<string | undefined>;
}