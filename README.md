# LEX

A lightweight alternative to React that supports similar JSX syntax and compiles to vanilla JavaScript. LEX operates directly on the DOM without virtual DOM overhead, making it perfect for small to medium projects that don't need React's full feature set.

## Installation

```bash
npm i @lek-js/lex
```

Then import it in your JavaScript:

```js
import Lex from "@lek-js/lex";
```

## Core Features

### createElement

`Lex.createElement` allows you to create HTML elements. It takes the tag as the first parameter, props as the second parameter, and children as additional parameters.

```js
const myElement = Lex.createElement("h1", {className: "my-class"});
```

Or with JSX:

```jsx
const myElement = <h1 className="my-class">children</h1>
```

Like React, you can nest children with more `Lex.createElement` calls or text strings. You can also add elements selected with `document.querySelector` or created with `document.createElement`.

This function returns a DOM element directly (or an array of elements), so you can access all element properties directly.

```jsx
const myElement = <h1 className="my-class">children</h1>
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

This implementation doesn't behave exactly like React. Behind the scenes, it only binds events to trigger reactivity where needed. It doesn't execute functions in cascade or reconcile a virtual DOM (since there's no virtual DOM - only the real DOM). This means `MyComponent` won't re-execute when you call `setCount`; only the state value will update and the associated elements on screen will change.

For this reason (the fact of operating directly on the DOM), `State` only has desirable behavior as an attribute or single child. Since text nodes are added to the real DOM, it's preferable to use it only as a single child. For finer control, it's recommended to use the native DOM API with `textContent` or `appendChild`.

### Refs

References are very useful in LEX and are similar to React but simpler:

```jsx
const MyComponent = () => {
    const inputRef = { current: null }; // or use Lex.useRef(null);

    return <div>
        <h1>Enter your email</h1>
        <label>
            Email: <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => { console.log(inputRef.current.value) }}>Send</button>
    </div>
}
```

When you pass a ref as a property to `Lex.createElement` and the tag is a string, `Lex.createElement` will assign the element value to `props.ref.current`, allowing you to access the HTML element later. 

This is especially useful for selecting a specific element from a large component without having to declare everything. (In the case of functional components, ref is passed as one more prop).

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
        <button onClick={() => { console.log(inputRef.current.value) }}>Send</button>
    </div>;

    console.log(inputRef.current.value); // <---HERE--->

    return content;
}
```

### Fragment

A basic implementation for handling lists of sibling elements. It simply returns children as an array:

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

A wrapper that registers functions to be executed on the client side. This prevents the LEX builder from executing code that should only run after the component is hydrated in the browser.

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

A signal function that receives the main component and then executes all registered client-side code. This should be called at the end of declarations

```jsx

const app = <App />;

// Execute all client-side code
Lex.mount(app);
```
or alternatively
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
            Dynamic content added on client
        </h1>)
    });

    return content;
}

Lex.mount(<MyComponent />);
```

#### How It Works

0. **Build Phase**: When building with `buildHTML`, the code is executed in a sandbox based on the value received in `mount()`. Each HTML element is marked with a `lexid` to be selected in the next phase.
1. **Hydration Phase**: Already on the client, during initial render, LEX uses `document.querySelector` to find existing elements with `lexid` attributes
2. **Client Phase**: After `mount()` is called, LEX switches to using `document.createElement` for new elements
3. **Execution Control**: All `useClient` callbacks are queued and executed only when `mount()` is called

#### Additional Note

If you don't want to use `useClient`, code that executes after `mount()` has the same effect. The `useClient` function is simply a convenience for better organizing code that requires hydration.

### Hydration with lexid

LEX includes a built-in hydration system using the `lexid` attribute. This prop is automatically added to all elements generated by LEX to enable selective element creation and hydration.

When LEX creates elements, it assigns a unique `lexid` to each one. If an element with the same `lexid` already exists in the DOM (created by the builder and present in the HTML), LEX will select and reuse that existing element instead of creating a new one.

This hydration approach allows you to:
- Pre-render components on the server
- Hydrate them on the client without recreating the entire DOM
- Maintain state and event listeners efficiently

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

The `lexid` system works automatically - you don't need to manually manage these IDs. LEX-BUILDER and LEX handle the assignment and selection logic internally to ensure proper hydration.

## Builder

You can compile with esbuild, for example, by simply changing the JSXFactory to `Lex.createElement`. However, I've developed a builder available in this same repository:

### build-html

If you're getting started and want to compile to HTML, this is the simplest module.

```js
const buildHTML = require("@lek-js/build-html");

const options = { minify:true, write:true, outfile: "output.html" };

buildHTML.byStringCode(stringCode, codeVirtualPath, options);
buildHTML.standart("entry-point.jsx", options);
buildHTML.layout("layout.jsx", "page.jsx", options);
```
With `byStringCode` you can process JavaScript from a string and the virtual path of the file to resolve relative paths. It's for finer use than the following.

With `standart` you must declare all JSX code including the layout and mounting of the main component, as well as the call to `Lex.mount()` in a file and pass the path as an argument:

```jsx
import Lex from "@lek-js/lex";
Lex.mount(<html>
    <head>bla bla bla</head>
    <body>bla bla bla</body>
<html>);
```
You will receive HTML as output.

With `layout` it accepts a `layout.jsx` file and a `page.jsx` file in Next.js style:

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
By default the builder will compile based on

```jsx
Lex.mount(<Layout><Page /></Layout>);
```

#### Configuration Options

- **`minify`**: Whether or not to minify the JavaScript inside the HTML
- **`write`**: If `true`, writes to disk based on the `outfile` option. If `false`, returns the code as a string
- **`outfile`**: For when `write` is `true`

### build-jsx

Also has `standart`, `layout` and `byStringCode` versions, but returns the JavaScript for client without HTML.

This is for integration with frameworks or more advanced control. You need to make sure to properly hydrate the HTML.

## Why LEX?

I've been developing with React for a long time and I really like its syntax. I think it's a very powerful library. However, I've been reflecting on small and medium projects that don't really need a virtual DOM or the overhead of cascading functions and DOM reconciliation with the virtual DOM.

Reading the community, I've heard many people asking for something like JSX to be part of the web standard. The thing is that JSX is very seductive, visually semantic, and avoids nesting endless elements like you have to do in vanilla JavaScript. This is my proposal to generate a sort of "vanilla.jsx".

LEX is extremely lightweight and operates directly on the DOM.