class State
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

const useState = (initValue) => 
{
    const state = new State(initValue);
    return [state, newValue => { state.set(newValue) }];
}
const useRef = initValue => ({ current: initValue });

const lexElements = Array.from(document.querySelectorAll("[lexid]"));

let counter = 0;

const createElement = (tag, props={}, ...children) =>
{
    if(!props) props = {};
    props.lexid = counter;
    let element;
    let selectMode = false;
    if(lexElements.length > 0)
    {
        element = document.querySelector(`[lexid="${props.lexid}"]`);
        lexElements.shift();
        selectMode = true;
    }
    
    if(typeof tag === 'string')
    {
        if(!selectMode) element = document.createElement(tag);

        if(props.ref && props.ref instanceof Object)
        {
            props.ref.current = element;
        }
        for(let [key, value] of Object.entries(props))
        {
            if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2).toLowerCase(), value);
            else if(value instanceof State)
            {
                value.appendOnChange((newValue) =>
                {
                    props[key] = newValue;
                    element.setAttribute(key, newValue);
                })
            }
            else element.setAttribute(key, value);
        }
        children.reduce((acc, ch) => [...acc, ...Array.isArray(ch) ? ch : [ch]],[])
        .forEach((ch, i) =>
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
    }
    else if(typeof tag === 'function')
    {
        if(!selectMode) element = tag({ ...props, children });
    }

    counter++;
    return element
}

const Lex = { createElement, State, useState, useRef };

export default Lex;