/**
 * @typedef {import("./types").State} State
 * @typedef {import("./types").StateClass} StateClass
 * @typedef {import("./types").UseState} UseState
 * @typedef {import("./types").UseRef} UseRef
 * @typedef {import("./types").FragmentComponent} FragmentComponent
 * @typedef {import("./types").CreateElement} CreateElement
 * @typedef {import("./types").Lex} Lex
 * @typedef {import("./types").UseClient} UseClient
 * @typedef {import("./types").Mount} Mount
*/

/**@type {StateClass}*/
export class State
{
    constructor(initValue)
    {
        this._value = initValue;
        this.onChangesStack = [];
    }
    get()
    {
        return this._value;
    }
    set(newValue)
    {
        this._value = newValue;
        this.onChangesStack.forEach(fn => fn(newValue));
    }
    valueOf()
    {
        return this._value;
    }
    toString()
    {
        return String(this._value);
    }
    appendOnChange(fn)
    {
        if(typeof fn === "function") this.onChangesStack.push(fn);
    }
}

/**@type {UseState}*/
export const useState = (initValue) => 
{
    const state = new State(initValue);
    return [state, newValue => { state.set(newValue) }];
}

/**@type {UseRef}*/
export const useRef = initValue => ({ current: initValue });

const flattenChildren = (children) =>
{
    const result = [];
    children.forEach(ch =>
    {
        if(Array.isArray(ch))
        {
            result.push(...flattenChildren(ch));
        }
        else result.push(ch);
    })
    return result;
}

const lexStates = {
    counter : 0,
    clientStack : [],
    selectMode : true,
};

/**@type {CreateElement}*/
export const createElement = (tag, props={}, ...children) =>
{
    if(!props) props = {};
    props.lexid = lexStates.counter;

    if(typeof tag === 'string')
    {
        const element = lexStates.selectMode ? 
            document.querySelector(`[lexid="${props.lexid}"]`)
            :
            document.createElement(tag)
        ;
        Object.entries(props).forEach(([key, value]) =>
        {
            const prop = {
                type: "attribute",
                key: key,
                value: value
            }
            //Obtener estados
            if (key.startsWith("on") && typeof value === "function")
            {
                prop.key = key.toLowerCase();
                prop.type = "event";
            }
            else if(key === "ref" && value instanceof Object)
            {
                props.ref.current = element;
            }
            else if(key === "className")
            {
                prop.key = "class";
                prop.type = "attribute";
            }
            else if(key === "htmlFor")
            {
                prop.key = "for";
                prop.type = "attribute";
            }
            else
            {
                prop.key = key.toLowerCase();
                prop.type = "attribute";
            }
            
            //Asignar propiedades
            const asignProp = () =>
            {
                if(prop.type === "attribute")
                {
                    element.setAttribute(prop.key, prop.value);
                }
                else if(prop.type === "event")
                {
                    element[prop.key] = prop.value;
                }
            }
            asignProp();

            //Gestionar estados
            if(value instanceof State)
            {
                value.appendOnChange((newValue) =>
                {
                    prop.value = newValue;
                    asignProp();
                })
            }
        });

        flattenChildren(children).forEach((ch, i) =>
        {
            if(lexStates.selectMode)
            {
                if(ch instanceof State)
                {
                    //En el futuro hay que gestionarlo de mejor manera... esto solo funciona si no hay text nodes asyacentes
                    const textNode = element.childNodes[i];
                    ch.appendOnChange((newValue) =>{ textNode.nodeValue = newValue })
                }
            }
            else
            {
                if(ch instanceof window.Node)   element.appendChild(ch);
                else
                {
                    const textNode = document.createTextNode(String(ch));
                    element.appendChild(textNode);
                    if(ch instanceof State)
                    {
                        ch.appendOnChange((newValue) =>{ textNode.nodeValue = newValue })
                    }
                }
            }
        });

        lexStates.counter++;
        return element;
    }
    else if(typeof tag === 'function')
    {
        const element = tag({ ...props, children });
        if(element instanceof Promise)
        {
            throw new Error("Lex.createElement doesn't support async components");
        }
        return element;
    }
}

/**@type {FragmentComponent}*/
export const Fragment = ({ children }) => children;


/**@type {UseClient}*/
export const useClient = (handler) =>
{
    if(typeof handler === "function")
    {
        lexStates.clientStack.push(handler);
    }
    else
    {
        throw new Error("useClient only accepts functions");
    }
}

export const startClient = () =>
{
    if(lexStates.selectMode)
    {
        lexStates.selectMode = false;
        lexStates.clientStack.forEach(handler => handler());
        lexStates.clientStack.length = 0;
    }
};

export const mount = (mainComponent) =>
{
    //Asume que el componente principal está seleccionado del html
    startClient();
}

/**@type {Lex}*/
const Lex = { createElement, State, useState, useRef, Fragment, useClient, startClient, mount };

export default Lex;