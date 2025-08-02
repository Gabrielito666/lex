import { LexJstBuildOptions } from "../build-jsx/types";
export interface LexBuildHTML
{
    (pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    standart(pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    layout(layoutJSX:string, pageJSX:string, options?:LexJstBuildOptions):Promise<string>;
    byStringCode(stringCode:string, resolveDir:string, options?:LexJstBuildOptions):Promise<string>;
}