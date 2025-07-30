/**
 * @typedef {import("./types.d.ts").State} State
 * @typedef {import("./types.d.ts").StateClass} StateClass
 * @typedef {import("./types.d.ts").UseState} UseState
 * @typedef {import("./types.d.ts").UseRef} UseRef
 * @typedef {import("./types.d.ts").FragmentComponent} FragmentComponent
 * @typedef {import("./types.d.ts").CreateElement} CreateElement
 * @typedef {import("./types.d.ts").Lex} Lex
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

const lexElements = Array.from(document.querySelectorAll("[lexid]"));

const counter = {current : 0};

/**@type {CreateElement}*/
export const createElement = (tag, props={}, ...children) =>
{
    if(!props) props = {};
    props.lexid = counter.current;
    let element;
    let selectMode = false;
    if(lexElements.length > counter.current)
    {
        element = document.querySelector(`[lexid="${props.lexid}"]`);
        selectMode = true;
    }
    
    if(typeof tag === 'string')
    {
        if(!selectMode) element = document.createElement(tag);

        Object.entries(props).forEach(([key, value]) =>
        {
            if (key.startsWith("on") && typeof value === "function")
            {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else if(value instanceof State)
            {
                value.appendOnChange((newValue) =>
                {
                    props[key] = newValue;
                    element.setAttribute(key, newValue);
                })
            }
            else if(key === "ref" && value instanceof Object)
            {
                props.ref.current = element;
            }
            else
            {
                element.setAttribute(key, value);
            }
        });

        flattenChildren(children).forEach((ch, i) =>
        {
            if(selectMode)
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
        })
        counter.current++;
    }
    else if(typeof tag === 'function')
    {
        if(!selectMode) element = tag({ ...props, children });
        else tag({ ...props, children });
    }

    return element;
}

/**@type {FragmentComponent}*/
export const Fragment = ({ children }) => children;

/**@type {Lex}*/
const Lex = { createElement, State, useState, useRef, Fragment };

export default Lex;