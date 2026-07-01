/**
 * @file
 * @source ./lib/process-props/index.js
 * @description This functions help to manage element attributes
 */

import { State } from "#lib/state";

/**
 * @typedef {(
 * 	{ type: "attribute", key: string, value:any } |
 * 	{ type: "event", key: string, value:any } |
 * 	{ type: "keep", key: string, value:any } |
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
		return { key: key.toLowerCase().replace(/^on/, ""), type: "event", value }
	}
	if(key === "__keep")
	{
		return { key, value, type: "keep" };
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
	return { key: key.toLowerCase(), type: "attribute", value };
}

/**
 * @param {PropDef} prop
 * @param {Element} element
 * @returns {void}
 */
const asignProp = (prop, element) =>
{
	//we ignore keep for not set this att
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
 * @param {PropDef} prop
 * @param {Element} element
 * @returns {void}
 */
const hydrateProp = (prop, element) =>
{
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
 * @param {Element} element
 * @param {Record<string, unknown>} props
 */
export const asignProps = (element, props) => Object.entries(props).forEach(([key, value]) =>
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
/**
 * @param {Element} element
 * @param {Record<string, unknown>} props
 */
export const hydrateProps = (element, props) => Object.entries(props).forEach(([key, value]) =>
{
	const prop = analyseProp(key, value);
	hydrateProp(prop, element);

	if(value instanceof State)
	{
		value.appendOnChange((newValue) =>
		{
			prop.value = newValue;
			asignProp(prop, element);
		})
	}
});
