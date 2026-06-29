/**
 * @file
 * @source ./lib/mount/index.js
 * @description Is the function to initialize the app
 */

import {lexVariables} from "#lib/lex-variables";

/**
 * @returns void
 */
export const startClient = () =>
{
    if(lexVariables.selectMode)
    {
        lexVariables.selectMode = false;
        lexVariables.clientStack.forEach(handler => handler());
        lexVariables.clientStack.length = 0;
    }
};

/**
 * @param {Function|any} mainComponent
 */
export const mount = (mainComponent) =>
{
    //Asume que el componente principal está seleccionado del html
    startClient();
}

