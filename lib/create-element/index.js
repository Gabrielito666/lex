/**
 * @file
 * @source ./lib/create-element/index.js
 * @description The createElement to jsx
 */

import { lexVariables } from "#lib/lex-variables";
import { State } from "#lib/state";
import { flattenChildren } from "#lib/flatten-childs";
import { asignProps, hydrateProps } from "#lib/process-props";
import {asignChildren, hydrateChildren} from "#lib/process-children";

/**
 * @import { Ref } from "#lib/ref";
 * @import { ElementRecursiveArray } from "#lib/flatten-childs";
 */

/**
 * @typedef {{
 * 	ref?: Ref<any>;
 * 	__keep?: boolean;
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
const createElementFromString_buildMode = (tag, props, ...children) =>
{
	const _props = props || /**@type{Record<string, any>}*/({});
	const _element = document.createElement(tag);
	const _children = flattenChildren(children);

	if(["head", "html"].includes(tag))
	{
		//TODO: cambiar por otro atributo tipo lex_root o similar
		_element.setAttribute("lexid", String(lexVariables.counter))
	}

	const needsHidrat = _props.ref ||
	_props.__keep ||
	Object.values(_props).some(val => val instanceof State || typeof val === "function") ||
	_children.some(ch => ch instanceof State);

	if(needsHidrat)
	{
		_element.setAttribute("lexid", String(lexVariables.counter));
	}

	asignProps(_element, _props);
	asignChildren(_element, _children);
	lexVariables.counter++;

	return /**@type {R}*/(/**@type {unknown}*/(_element));
}
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
const createElementFromString_createMode = (tag, props, ...children) =>
{
	const _props = props || /**@type{Record<string, any>}*/({});
	const _element = document.createElement(tag);
	const _children = flattenChildren(children);

	asignProps(_element, _props);
	asignChildren(_element, _children);

	return /**@type {R}*/(/**@type {unknown}*/(_element));
}

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
const createElementFromString_selectMode = (tag, props, ...children) =>
{
	const _props = props || /**@type{Record<string, any>}*/({});
	const _children = flattenChildren(children);

	const needsHidrat = _props.ref ||
	_props.__keep ||
	Object.values(_props).some(val => val instanceof State || typeof val === "function") ||
	_children.some(ch => ch instanceof State);

	if(needsHidrat)
	{
		const _element = document.querySelector(`[lexid="${lexVariables.counter}"]`);
		if(!_element)
		{
			throw new Error("No element requiring hydration was found. Make sure you do not include dynamic or non-deterministic code in your app's main tree during the app build process.");
		}
		hydrateProps(_element, _props);
		hydrateChildren(_element, _children);
		lexVariables.counter++;

		return /**@type {R}*/(/**@type {unknown}*/(_element));
	}

	lexVariables.counter++;
	//Aquí estoy engañando a typescript
	//La firma de la función no incluye null como retorno posible
	//pero esto se documentará y en un futuro se crearán herramientas externas
	//para evitar posibles problemas deribados de este engaño
	return /**@type {R}*/(/**@type {unknown}*/(null));
}
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
	if(lexVariables.mode === "select")
	{
		return createElementFromString_selectMode(tag, props, ...children);
	}
	if(lexVariables.mode === "create")
	{
		return createElementFromString_createMode(tag, props, ...children);
	}
	return createElementFromString_buildMode(tag, props, ...children);
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
