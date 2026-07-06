# LEX

A lightweight alternative to React that supports a similar JSX syntax and compiles to vanilla JavaScript. LEX operates directly on the DOM without the overhead of a virtual DOM, making it perfect for small to medium projects that don't need React's full feature set.

## Installation

```bash
npm i @lek-js/lex
```

Then import it into your JavaScript:

```js
import Lex from "@lek-js/lex";
```

## Main Features

### Modes

The app lifecycle includes a build-time and a run-time.

During build time, `createElement` will always use `document.createElement()` under the hood. In this mode, the app is configured to assign `lexid` attributes to elements that need hydration at runtime (buttons with events, inputs with refs, labels with different states, etc.). More on the compiler usage later.

At runtime there are 2 sub-modes: select-mode and create-mode.
At the start, the app must be mounted with `Lex.mount(<MainComponent>)`. While the app mounts, it hydrates those elements that have a `lexid` by adding the necessary event listeners or refs. In this case, `document.querySelector` is used under the hood.

Note that in this mode, only the elements that need hydration are returned, since they are the only ones with a `lexid`. The rest are considered static elements that have already been written to the HTML by the bundler. Therefore, if you want to access an element in a constant during the mount process, you can use the `__keep` attribute:

```jsx
const myElement = <h1 __keep>My H1</h1>;
console.log(myElement); // will NOT be null
console.log(<h1>Another H1</h1>); // will be null
```

Inside event listeners or within `useClient`, `__keep` is not necessary, but it can be super useful during the mount phase.

In create-mode, `document.createElement()` is used under the hood, meaning the created element is always returned. This mode is what you will use inside event listeners or within the `useClient` hook.

### createElement

`Lex.createElement` allows you to create HTML elements. It takes the tag as the first parameter, props as the second parameter, and children as additional parameters.

```js
const MyElement = () => Lex.createElement("h1", {className: "my-class"});
```

Or with JSX:

```jsx
const MyElement = () => <h1 className="my-class">children</h1>;
```

Like React, you can nest children with more `Lex.createElement` calls or plain strings. You can also add elements selected with `document.querySelector` or created with `document.createElement`.

This function returns a DOM element directly (or an array of elements), so you can access all element properties directly.

```jsx
const myElement = <h1 className="my-class" __keep>children</h1>
myElement.appendChild(<span>Another element or text</span>);
myElement.remove();
```

You can also pass functions as tags that return HTML elements (components):

```jsx
const MyElement = ({className}) => <h1 className={className}>children</h1>;

const subElement = <div><MyElement className="my-class"/></div>
```

### State Management

LEX provides a `State` class for reactivity. It can be used as props or children in `Lex.createElement`:

```jsx
const MyComponent = () => {
    const state = new Lex.State(0); // initial value

    return <div>
        <h1>{state}</h1>
        <button onClick={() => {state.set(state.get() + 1)}}>Increment</button>
    </div>
}
```

LEX also includes a `useState` function following React's style:

```jsx
const MyComponent = () => {
    const [count, setCount] = Lex.useState(0);

    return <div>
        <h1>{count}</h1>
        <button onClick={() => {setCount(count + 1)}}>Increment</button>
    </div>
}
```

#### Important Note

This implementation does not behave exactly like React. Behind the scenes, it only binds events to trigger reactivity where needed. It does not cascade through functions or reconcile a virtual DOM (since there is no virtual DOM — only the real DOM). This means `MyComponent` will NOT re-execute when you call `setCount`; only the state value updates and the associated elements on screen change.

For this reason (operating directly on the DOM), `State` only behaves predictably as an attribute or as an only child. Since text nodes accumulate in the real DOM, it is preferable to use it only as a single child. For finer-grained control, it is recommended to use the native DOM API with `textContent` or `appendChild`.

### Refs

Refs are very useful in LEX and are similar to React but simpler:

```jsx
const MyComponent = () => {
    const inputRef = { current: null }; // or use Lex.useRef(null);

    return <div>
        <h1>Enter your email</h1>
        <label>
            Email: <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => { console.log(inputRef.current.value) }}>Submit</button>
    </div>
}
```

When you pass a ref as a prop to `Lex.createElement` and the tag is a string, `Lex.createElement` will assign the element's value to `props.ref.current`, allowing you to access the HTML element later.

This is especially useful for selecting a specific element from a large component without having to declare everything. (In the case of functional components, ref is passed as just another prop.)

#### Important Note

The ref is only assigned after the `Lex.createElement` call, so when using `ref.current`, make sure it has a value. For example, use it from an `onClick` callback (as in the example) or below:

```jsx
const MyComponent = () => {
    const inputRef = { current: null };

    const content = <div>
        <h1>Enter your email</h1>
        <label>
            Email: <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => { console.log(inputRef.current.value) }}>Submit</button>
    </div>;

    console.log(inputRef.current.value); // <---HERE--->

    return content;
}
```

### Fragment

A basic implementation for handling lists of sibling elements. It simply returns the children as an array:

```jsx
const MyFragment = () => <><h1>Sibling 1</h1><h1>Sibling 2</h1></>;
const MyComponent = () => {
    return <div>
        <MyFragment />
    </div>
}
```

### useClient & mount

LEX provides a sophisticated client-side execution system with two key functions that work together to manage server-side rendering and client-side hydration:

#### useClient

A wrapper that registers functions to be executed on the client side. This prevents the LEX constructor from executing code that should only run after the component has been hydrated in the browser.

```jsx
const MyComponent = () => {
    Lex.useClient(() => {
        fetch("api/data")
    });

    return <div>
        <h1>My Component</h1>
    </div>
}
```

#### mount

A signal function that takes the main component and then executes all the registered client-side code. This should be called at the end of the declarations.

```jsx
Lex.mount(<App />);
```

#### Complete Example

```jsx
const MyComponent = () => {
    const divRef = Lex.useRef(null);

    const content = <div ref={divRef}>
        <h1>Static Content</h1>
    </div>

    // This will only execute after mount() is called
    Lex.useClient(() => {
        divRef.current.appendChild(<h1>
            Dynamic content added on the client
        </h1>)
    });

    return content;
}

Lex.mount(<MyComponent />);
```

#### How It Works

0. **Build Phase**: When building with `buildHTML`, the code runs in a sandbox based on the value received in `mount()`. Elements that need hydration are marked with a `lexid` to be selected in the next phase.
1. **Hydration Phase**: On the client, during initial rendering, LEX uses `document.querySelector` to find existing elements with `lexid` attributes.
2. **Client Phase**: After `mount()` is called, LEX switches to using `document.createElement` for new elements.
3. **Execution Control**: All `useClient` callbacks are queued and only executed when `mount()` is called.

### Hydration with lexid

LEX includes a built-in hydration system using the `lexid` attribute. This prop is automatically added to all LEX-generated elements that need it to enable selective element creation and hydration.

When LEX creates elements, it assigns a unique `lexid` to each one. If an element with the same `lexid` already exists in the DOM (created by the builder and present in the HTML), LEX will select and reuse that existing element instead of creating a new one.

This hydration approach allows you to:
- Pre-render components on the server
- Hydrate them on the client without recreating the entire DOM
- Efficiently maintain state and event listeners

```jsx
// If this HTML already exists in the DOM:
// <div lexid="0"><h1 lexid="1">Hello World</h1></div>

const MyComponent = () => {
    return <div>
        <h1>Hello World</h1>
    </div>
}

// LEX will select the existing elements instead of creating new ones
```

#### Important Note

The `lexid` system works automatically — you don't need to manage these IDs manually. LEX-BUILDER and LEX handle the assignment and selection logic internally to ensure proper hydration.

## Builder

You can compile with esbuild, for example, by simply changing the JSXFactory to `Lex.createElement`. However, I have developed a builder available in this same repository:

### build-html

If you are just starting out and want to compile to HTML, this is the simplest module.

```js
const buildHTML = require("@lek-js/build-html");

const options = { minify: true };

buildHTML.byStringCode(stringCode, codeVirtualPath, options);
buildHTML.standart("entry-point.jsx", options);
buildHTML.layout("layout.jsx", "page.jsx", options);
```

With `byStringCode` you can process JavaScript from a string along with the file's virtual path to resolve relative paths. It is for finer-grained use than the ones below.

With `standart` you must declare all the JSX code including the layout and main component mounting, as well as the `Lex.mount()` call, in a single file and pass the path as an argument:

```jsx
import Lex from "@lek-js/lex";
Lex.mount(<html>
    <head>bla bla bla</head>
    <body>bla bla bla</body>
<html>);
```

It will output HTML.

With `layout` it takes a `layout.jsx` file and a `page.jsx` file in the style of Next.js:

```jsx
// layout.jsx
const Layout = ({children}) =>
{
    return <html>
        <head></head>
        <body>{children}</body>
    </html>
}
export default Layout

// page.jsx
const Page = () =>
{
    return <main>
        <h1>Hello world!</h1>
    </main>
}
export default Page;
```

By default, the builder will compile based on:

```jsx
Lex.mount(<Layout><Page /></Layout>);
```

These methods gracefully handle CSS imports and embed the styles into the HTML.

#### Configuration Options

- **`minify`**: Whether to minify the JavaScript inside the HTML or not

#### return-type
These methods return a **discriminated union** that you should always check before using the data:

```ts
{
	htmlText: string;
	assets: import("esbuild").OutputFile[];
	error: null;
	warnings: import("esbuild").Message[];
} | {
	htmlText: null;
	assets: null;
	error: Error | import("esbuild").BuildFailure;
}
```

On success, `error` is `null` and you have access to `htmlText`, `assets`, and `warnings`.
On error, `error` contains the problem and all other fields are `null`.

```js
const result = await buildHTML.standart("page.jsx");
if (result.error)
{
	console.error("Error compiling:", result.error);
	return;
}
// result.htmlText, result.assets, result.warnings available
```

You must then write the file with `fs` and handle the assets if you use image or font imports.

### build-jsx

It also has a `standart`, `layout`, and `byStringCode` version, but it returns the client-side JavaScript without HTML.

This is for integration with frameworks or more advanced control. You need to make sure to hydrate the HTML properly.

#### return-type
Same **discriminated union** pattern:

```ts
{
	bundle: import("esbuild").OutputFile;
	css?: import("esbuild").OutputFile;
	assets: import("esbuild").OutputFile[];
	error: null;
	warnings: import("esbuild").Message[];
} | {
	bundle: null;
	css: null;
	assets: null;
	error: Error | import("esbuild").BuildFailure;
}
```

```js
const result = await buildJSX.standart("page.jsx");
if (result.error)
{
	console.error("Error compiling:", result.error);
	return;
}
// result.bundle, result.css, result.assets, result.warnings available
```

## Why LEX?

I have been developing with React for a long time and I really like its syntax. I think it is a very powerful library. However, I have been thinking about small to medium projects that really don't need a virtual DOM or the overhead of cascading functions and DOM reconciliation with the virtual DOM.

Reading the community, I have heard many people asking for something like JSX to become part of the web standard. The thing is, JSX is very seductive, visually semantic, and avoids the endless element nesting you have to do in vanilla JavaScript. This is my proposal to generate a kind of "vanilla.jsx".

LEX is extremely lightweight and operates directly on the DOM.
