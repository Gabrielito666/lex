/**
 * @file
 * @source ./lib/state/index.js
 * @description class and function to manage states
 */

/**
 * @template T
 * @class
 */
export class State
{
    /**
     * @param {T} initValue
     */
    constructor(initValue)
    {
	/**@private*/
        this._value = initValue;
	/**@private @type {((value: any)=>void)[]}*/
        this.onChangesStack = [];
    }
    /**
     * @returns {T|any}
     */
    get()
    {
        return this._value;
    }
    /**
     * @param {any} newValue
     */
    set(newValue)
    {
        this._value = newValue;
        this.onChangesStack.forEach(fn => fn(newValue));
    }
    /**
     * @returns {unknown}
     */
    valueOf()
    {
        return this._value;
    }
    /**
     * @returns {string}
     */
    toString()
    {
        return String(this._value);
    }
    /**
     * @param {(value: any) => void} fn
     */
    appendOnChange(fn)
    {
        if(typeof fn === "function") this.onChangesStack.push(fn);
    }
}

/**
 * @template T
 * @param {T} initValue
 * @returns {[State<T>, (newValue:any)=>void ]}
 */
export const useState = (initValue) => 
{
    const state = new State(initValue);
    return [state, newValue => { state.set(newValue) }];
}
