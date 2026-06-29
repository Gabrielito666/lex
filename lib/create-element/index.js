/**
 * @file
 * @source ./lib/create-element/index.js
 * @description The createElement to jsx
 */

import { lexVariables } from "#lib/lex-variables";
import { State } from "#lib/state";
import { flattenChildren } from "#lib/flatten-childs";

/**
 * @import { Ref } from "#lib/ref";
 * @import { ElementRecursiveArray } from "#lib/flatten-childs";
 */

/**
 * @typedef {(
 * 	{ type: "attribute", key: string, value:any } |
 * 	{ type: "event", key: string, value:any } |
 * 	{ type: "ref", key: string, value: Record<string, any> }
 * )} PropDef
 */

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {PropDef}
 */
const analyseProp = (key, value) =>
{
	if (key.startsWith("on") && typeof value === "function")
	{
		return { key: key.toLowerCase(), type: "event", value }
	}
	if(key === "className")
	{
		return { key: "class", type: "attribute", value }
	}
	if(key === "ref" && value instanceof Object)
	{
		return { key, type: "ref", value }
	}
	if(key === "htmlFor")
	{
		return { key: "for", type: "attribute", value }
	}
	return { key: key.toLowerCase().replace(/^on/, ""), type: "attribute", value };
}

/**
 * @param {PropDef} prop
 * @param {Element} element
 * @returns {void}
 */
const asignProp = (prop, element) =>
{
	if(prop.type === "attribute")
	{
		element.setAttribute(prop.key, prop.value);
		return;
	}
	if(prop.type === "event")
	{
		element.addEventListener(prop.key, prop.value);
		return;
	}
	if(prop.type === "ref")
	{
		prop.value.current = element;
		return;
	}
}

/**
 * @typedef {{
 * 	ref?: Ref<any>;
 * 	className?:string;
 * 	htmlFor?:string;
 * } & Partial<HTMLElement>} StringComponentProps
 */

/**
 * @template {string}T
 * @template {StringComponentProps}P
 * @template {ElementRecursiveArray}C
 * @template {Element}R
 * @param {T} tag
 * @param {P|null} props
 * @param {...C} children
 * @returns {R}
 */
const createElementFromString = (tag, props, ...children) =>
{
	const _props = props || {};
	const element = lexVariables.selectMode ? 
		document.querySelector(`[lexid="${lexVariables.counter++}"]`)
		:
		document.createElement(tag)
	;

	if(element === null)
	{
		throw new Error("An element could not be found when initializing the application. Make sure you do not execute dynamic or non-deterministic code before the mounting process is complete.");
	};

	Object.entries(_props).forEach(([key, value]) =>
	{
		const prop = analyseProp(key, value);
		asignProp(prop, element);

		if(value instanceof State)
		{
			value.appendOnChange((newValue) =>
			{
				prop.value = newValue;
				asignProp(prop, element);
			})
		}
	});

	flattenChildren(children).forEach((ch, i) =>
	{
		if(ch === null) return;
		if(lexVariables.selectMode && ch instanceof State)
		{
			//En el futuro hay que gestionarlo de mejor manera... esto solo funciona si no hay text nodes asyacentes
			const textNode = element.childNodes[i];
			ch.appendOnChange((newValue) =>{ textNode.nodeValue = newValue });
			return;
		}	
		if(ch instanceof window.Node)
		{
			element.appendChild(ch);
			return;
		}

		const textNode = document.createTextNode(String(ch));
		element.appendChild(textNode);

		if(ch instanceof State)
		{
			ch.appendOnChange((newValue) =>{ textNode.nodeValue = newValue })
		}
		return;
	});

	lexVariables.counter++;
	return /**@type {R}*/(element);
}

/**
 * @template {(props:P & {children:C}) => R}T
 * @template {Record<string, any>}P
 * @template {ElementRecursiveArray}C
 * @template R
 * @param {T} tag
 * @param {P|null} props
 * @param {...C} children
 * @returns {R}
 */
const createElementFromFunction = (tag, props, ...children) =>
{
	const _props = props || {};
	const element = tag(
		/**@type {P&{children:C}}*/({ ..._props, children: flattenChildren(children) })
	);
	if(element instanceof Promise)
	{
		throw new Error("Lex.createElement doesn't support async components");
	}
	return element;
}

/**
 * @template {string|((props:P & {children:C}) => R)} T
 * @template {null|T extends string ? StringComponentProps : Record<string, any>}P
 * @template {ElementRecursiveArray}C
 * @template {T extends string ? Element : any}R
 * @param {T} tag
 * @param {P} props
 * @param {...C} children
 * @returns {R}
 */
export const createElement = (tag, props, ...children) =>
{
	if(typeof tag === 'string')
	{
		return createElementFromString(
			tag,
			/**@type{StringComponentProps|null}*/(props),
			...children
		);
	}
	return createElementFromFunction(
		tag,
		/**@type{P}*/(props),
		...children
	);
}
