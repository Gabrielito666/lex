(() => {
  // lib/lex-variables/index.js
  var lexVariables = {
    counter: 0,
    /**@type {Array<() =>any>}*/
    clientStack: [],
    selectMode: true
  };

  // lib/state/index.js
  var State = class {
    /**
     * @param {T} initValue
     */
    constructor(initValue) {
      this._value = initValue;
      this.onChangesStack = [];
    }
    /**
     * @returns {T|any}
     */
    get() {
      return this._value;
    }
    /**
     * @param {any} newValue
     */
    set(newValue) {
      this._value = newValue;
      this.onChangesStack.forEach((fn) => fn(newValue));
    }
    /**
     * @returns {unknown}
     */
    valueOf() {
      return this._value;
    }
    /**
     * @returns {string}
     */
    toString() {
      return String(this._value);
    }
    /**
     * @param {(value: any) => void} fn
     */
    appendOnChange(fn) {
      if (typeof fn === "function") this.onChangesStack.push(fn);
    }
  };
  var useState = (initValue) => {
    const state = new State(initValue);
    return [state, (newValue) => {
      state.set(newValue);
    }];
  };

  // lib/flatten-childs/index.js
  var flattenChildren = (children) => children.reduce(
    /**
     * @param {Array<Element|State<any>|string|null>} acc
     * @param {ElementRecursiveArray[number]} ch
     * @returns {Array<Element|State<any>|string|null>}
     */
    (acc, ch) => {
      Array.isArray(ch) ? acc.push(...flattenChildren(ch)) : acc.push(ch);
      return acc;
    },
    []
  );

  // lib/create-element/index.js
  var analyseProp = (key, value) => {
    if (key.startsWith("on") && typeof value === "function") {
      return { key: key.toLowerCase(), type: "event", value };
    }
    if (key === "className") {
      return { key: "class", type: "attribute", value };
    }
    if (key === "ref" && value instanceof Object) {
      return { key, type: "ref", value };
    }
    if (key === "htmlFor") {
      return { key: "for", type: "attribute", value };
    }
    return { key: key.toLowerCase().replace(/^on/, ""), type: "attribute", value };
  };
  var asignProp = (prop, element) => {
    if (prop.type === "attribute") {
      element.setAttribute(prop.key, prop.value);
      return;
    }
    if (prop.type === "event") {
      element.addEventListener(prop.key, prop.value);
      return;
    }
    if (prop.type === "ref") {
      prop.value.current = element;
      return;
    }
  };
  var createElementFromString = (tag, props, ...children) => {
    const _props = props || {};
    const element = lexVariables.selectMode ? document.querySelector(`[lexid="${lexVariables.counter++}"]`) : document.createElement(tag);
    if (element === null) {
      throw new Error("An element could not be found when initializing the application. Make sure you do not execute dynamic or non-deterministic code before the mounting process is complete.");
    }
    ;
    Object.entries(_props).forEach(([key, value]) => {
      const prop = analyseProp(key, value);
      asignProp(prop, element);
      if (value instanceof State) {
        value.appendOnChange((newValue) => {
          prop.value = newValue;
          asignProp(prop, element);
        });
      }
    });
    flattenChildren(children).forEach((ch, i) => {
      if (ch === null) return;
      if (lexVariables.selectMode && ch instanceof State) {
        const textNode2 = element.childNodes[i];
        ch.appendOnChange((newValue) => {
          textNode2.nodeValue = newValue;
        });
        return;
      }
      if (ch instanceof window.Node) {
        element.appendChild(ch);
        return;
      }
      const textNode = document.createTextNode(String(ch));
      element.appendChild(textNode);
      if (ch instanceof State) {
        ch.appendOnChange((newValue) => {
          textNode.nodeValue = newValue;
        });
      }
      return;
    });
    lexVariables.counter++;
    return (
      /**@type {R}*/
      element
    );
  };
  var createElementFromFunction = (tag, props, ...children) => {
    const _props = props || {};
    const element = tag(
      /**@type {P&{children:C}}*/
      { ..._props, children: flattenChildren(children) }
    );
    if (element instanceof Promise) {
      throw new Error("Lex.createElement doesn't support async components");
    }
    return element;
  };
  var createElement = (tag, props, ...children) => {
    if (typeof tag === "string") {
      return createElementFromString(
        tag,
        /**@type{StringComponentProps|null}*/
        props,
        ...children
      );
    }
    return createElementFromFunction(
      tag,
      /**@type{P}*/
      props,
      ...children
    );
  };

  // lib/fragment/index.js
  var Fragment = ({ children }) => children;

  // lib/mount/index.js
  var startClient = () => {
    if (lexVariables.selectMode) {
      lexVariables.selectMode = false;
      lexVariables.clientStack.forEach((handler) => handler());
      lexVariables.clientStack.length = 0;
    }
  };
  var mount = (mainComponent) => {
    startClient();
  };

  // lib/ref/index.js
  var useRef = (initValue) => ({ current: initValue });

  // lib/use-client/index.js
  var useClient = (handler) => {
    if (typeof handler !== "function") throw new Error("useClient only accepts functions");
    lexVariables.clientStack.push(handler);
  };

  // lib/lex/index.js
  var Lex = {
    createElement,
    Fragment,
    mount,
    useRef,
    State,
    useState,
    useClient,
    startClient
  };
  var lex_default = Lex;

  // test-lab/index.jsx
  var Layout = ({ children }) => /* @__PURE__ */ lex_default.createElement("html", null, /* @__PURE__ */ lex_default.createElement("head", null), /* @__PURE__ */ lex_default.createElement("body", null, children));
  var Page = () => {
    return /* @__PURE__ */ lex_default.createElement("main", null, /* @__PURE__ */ lex_default.createElement("h1", null, "Primera prueba de refactor"));
  };
  lex_default.mount(/* @__PURE__ */ lex_default.createElement(Layout, null, /* @__PURE__ */ lex_default.createElement(Page, null)));
})();
