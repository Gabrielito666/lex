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

When you pass a ref as a property to `Lex.createElement` and the tag is a string, `Lex.createElement` will assign the element value to `props.ref.current`, allowing you to access the HTML element later. This is especially useful for selecting a specific element from a large component without having to declare everything.

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
### useClient & startClient

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

#### startClient

A signal function that executes all registered client-side code. This should be called after the root component(s) have been mounted to ensure all DOM elements are available.

```jsx
// After mounting your root component
const app = <App />;
document.body.appendChild(app);

// Execute all client-side code
Lex.startClient();
```

#### Complete Example

```jsx
const MyComponent = () => {
    const divRef = Lex.useRef(null);

    const content = <div ref={divRef}>
        <h1>Static Content</h1>
    </div>

    // This will only execute after startClient() is called
    Lex.useClient(() => {
        divRef.current.appendChild(<h1>
            Dynamic content added on client
        </h1>)
    });

    return content;
}

// Mount component
const app = <MyComponent />;
document.body.appendChild(app);

// Execute all client-side code
Lex.startClient();
```

#### How It Works

1. **Hydration Phase**: During initial render, LEX uses `document.querySelector` to find existing elements with `lexid` attributes
2. **Client Phase**: After `startClient()` is called, LEX switches to using `document.createElement` for new elements
3. **Execution Control**: All `useClient` callbacks are queued and executed only when `startClient()` is called

#### Important Notes

- **Call order matters**: Always call `startClient()` after mounting your root component
- **Async operations**: Perfect for API calls, event listeners, and dynamic content
- **SSR compatibility**: Enables true server-side rendering with client-side hydration
- **Performance**: Prevents unnecessary code execution during build time

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

The `lexid` system works automatically - you don't need to manually manage these IDs. LEX handles the assignment and selection logic internally to ensure proper hydration.

## Why LEX?

I've been developing with React for a long time and I really like its syntax. I think it's a very powerful library. However, I've been reflecting on small and medium projects that don't really need a virtual DOM or the overhead of cascading functions and DOM reconciliation with the virtual DOM.

Reading the community, I've heard many people asking for something like JSX to be part of the web standard. The thing is that JSX is very seductive, visually semantic, and avoids nesting endless elements like you have to do in vanilla JavaScript. This is my proposal to generate a sort of vanilla.jsx.

LEX is extremely lightweight and operates directly on the DOM.

## Compilation

You can compile with esbuild, for example, by just changing the JSXFactory to `Lex.createElement`. However, I've developed a builder available on npm:

```bash
npm i lex-builder
```

I'm working to include that builder in this same repository in another directory to be imported with `@lek-js/builder/`, but for now they're separate.

## Getting Started

1. Install LEX: `npm i @lek-js/lex`
2. Set up your build tool (esbuild, webpack, etc.) with JSX support
3. Configure JSX to use `Lex.createElement` as the factory
4. Start building with JSX syntax and vanilla JavaScript performance!

## Examples

Check out the `test/` directory for working examples of LEX components and features.