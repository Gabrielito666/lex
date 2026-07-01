/**
 * @file
 * @source ./lib/process-children/index.js
 * @description Module to process the childrens of a element
 */

/**
 * @import {ElementRecursiveArray} from "#lib/flatten-childs";
 */

import { flattenChildren } from "#lib/flatten-childs";
import { State } from "#lib/state";

/**
 * @param {Element} element
 * @param {ElementRecursiveArray} children
 */
export const asignChildren = (element, children) => flattenChildren(children).forEach((ch, i) =>
{
	if(!ch) return;

	if(ch instanceof window.Node)
	{
		element.appendChild(ch);
		return;
	}
	
	if(typeof ch === "string")
	{
		const textNode = document.createTextNode(String(ch));
		element.appendChild(textNode);
		return;
	}

	if(ch instanceof State)
	{
		const textNode = document.createTextNode(ch.get());
		element.appendChild(textNode);

		ch.appendOnChange((newValue) =>
		{
			textNode.nodeValue = newValue;
		});
		return;
	}
	return;
});

/**
 * @param {Element} element
 * @param {ElementRecursiveArray} children
 */
export const hydrateChildren = (element, children) => flattenChildren(children).forEach((ch, i) =>
{
	if(!ch) return;

	if(ch instanceof window.Node || typeof ch === "string")
	{
		return;
	}

	if(ch instanceof State)
	{
		const textNode =
			element.childNodes[i] ||
			Array.from(element.childNodes).find(chn => chn.textContent === ch.get())
		;

		if(!textNode)
		{
			throw new Error("Unexpected error while hydrating an element. The `state` object can only be used as the sole child of an element, or without adjacent `string` siblings. It cannot be used on elements that will modify their children, or with children that may be null. Best practice is to use it on tags that will not change the order or number of their children.");
		}
		ch.appendOnChange((newValue) =>
		{
			textNode.nodeValue = newValue;
		});
		return;
	}
	return;
});

