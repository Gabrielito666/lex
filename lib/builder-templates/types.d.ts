export interface BuilderTemplates
{
    standart(pageJsx:string):string;
    layout(layoutJsx:string, pageJsx:string):string;
}