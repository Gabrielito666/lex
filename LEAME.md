# LEX

Una alternativa ligera a React que soporta sintaxis JSX similar y compila a JavaScript vanilla. LEX opera directamente en el DOM sin la sobrecarga del DOM virtual, siendo perfecto para proyectos pequeños y medianos que no necesitan todo el conjunto de características de React.

## Instalación

```bash
npm i @lek-js/lex
```

Luego impórtalo en tu JavaScript:

```js
import Lex from "@lek-js/lex";
```

## Características Principales

### createElement

`Lex.createElement` te permite crear elementos HTML. Toma el tag como primer parámetro, props como segundo parámetro, e hijos como parámetros adicionales.

```js
const myElement = Lex.createElement("h1", {className: "my-class"});
```

O con JSX:

```jsx
const myElement = <h1 className="my-class">children</h1>
```

Como React, puedes anidar hijos con más llamadas a `Lex.createElement` o cadenas de texto. También puedes agregar elementos seleccionados con `document.querySelector` o creados con `document.createElement`.

Esta función retorna un elemento DOM directamente (o un array de elementos), por lo que puedes acceder a todas las propiedades del elemento directamente.

```jsx
const myElement = <h1 className="my-class">children</h1>
myElement.appendChild(<span>Otro elemento o texto</span>);
myElement.remove();
```

También puedes pasar funciones como tags que retornan elementos HTML (componentes):

```jsx
const MyElement = ({className}) => <h1 className={className}>children</h1>;

const subElement = <div><MyElement className="my-class"/></div>
```

### Gestión de Estado

LEX proporciona una clase `State` para reactividad. Puede ser usada como props o hijos en `Lex.createElement`:

```jsx
const MyComponent = () => {
    const state = new Lex.State(0); // valor inicial

    return <div>
        <h1>{state}</h1>
        <button onClick={() => {state.set(state.get() + 1)}}>Incrementar</button>
    </div>
}
```

LEX también incluye una función `useState` siguiendo el estilo de React:

```jsx
const MyComponent = () => {
    const [count, setCount] = Lex.useState(0);

    return <div>
        <h1>{count}</h1>
        <button onClick={() => {setCount(count + 1)}}>Incrementar</button>
    </div>
}
```

#### Nota Importante

Esta implementación no se comporta exactamente como React. Detrás de escena, solo vincula eventos para activar reactividad donde sea necesario. No ejecuta funciones en cascada ni reconcilia un DOM virtual (ya que no hay DOM virtual - solo el DOM real). Esto significa que `MyComponent` no se re-ejecutará cuando llames `setCount`; solo el valor del estado se actualizará y los elementos asociados en pantalla cambiarán.

Por esta razón (el hecho de operar directamente en el DOM), `State` solo tiene un comportamiento deseable como atributo o hijo único. Como los nodos de texto se suman en el DOM real, es preferible usarlo solo como hijo único. Para un manejo más fino se recomienda usar la API nativa del DOM con `textContent` o `appendChild`.

### Refs

Las referencias son muy útiles en LEX y son similares a React pero más simples:

```jsx
const MyComponent = () => {
    const inputRef = { current: null }; // o usa Lex.useRef(null);

    return <div>
        <h1>Ingresa tu email</h1>
        <label>
            Email: <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => { console.log(inputRef.current.value) }}>Enviar</button>
    </div>
}
```

Cuando pasas una ref como propiedad a `Lex.createElement` y el tag es una cadena, `Lex.createElement` asignará el valor del elemento a `props.ref.current`, permitiéndote acceder al elemento HTML más tarde. 

Esto es especialmente útil para seleccionar un elemento específico de un componente grande sin tener que declarar todo. (En el caso de componentes funcionales, ref se pasa como una prop más).

#### Nota Importante

La ref solo se asigna después de la llamada a `Lex.createElement`, así que cuando uses `ref.current`, asegúrate de que tenga un valor. Por ejemplo, úsala desde un callback `onClick` (como en el ejemplo) o abajo:

```jsx
const MyComponent = () => {
    const inputRef = { current: null };

    const content = <div>
        <h1>Ingresa tu email</h1>
        <label>
            Email: <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => { console.log(inputRef.current.value) }}>Enviar</button>
    </div>;

    console.log(inputRef.current.value); // <---AQUÍ--->

    return content;
}
```

### Fragment

Una implementación básica para manejar listas de elementos hermanos. Simplemente retorna los hijos como un array:

```jsx
const MyFragment = () => <><h1>Hermano 1</h1><h1>Hermano 2</h1></>;
const MyComponent = () => {
    return <div>
        <MyFragment />
    </div>
}
```

### useClient & mount

LEX proporciona un sistema sofisticado de ejecución del lado del cliente con dos funciones clave que trabajan juntas para gestionar el renderizado del lado del servidor y la hidratación del lado del cliente:

#### useClient

Un wrapper que registra funciones para ser ejecutadas en el lado del cliente. Esto previene que el constructor de LEX ejecute código que solo debería ejecutarse después de que el componente sea hidratado en el navegador.

```jsx
const MyComponent = () => {
    Lex.useClient(() => {
        fetch("api/data")
    });

    return <div>
        <h1>Mi Componente</h1>
    </div>
}
```

#### mount

Una función señal que recibe el componente principal y luego ejecuta todo el código registrado del lado del cliente. Esto debería llamarse al final de las declaraciones

```jsx

const app = <App />;

// Ejecutar todo el código del lado del cliente
Lex.mount(app);
```
o bien
```jsx
Lex.mount(<App />);
```

#### Ejemplo Completo

```jsx
const MyComponent = () => {
    const divRef = Lex.useRef(null);

    const content = <div ref={divRef}>
        <h1>Contenido Estático</h1>
    </div>

    // Esto solo se ejecutará después de que mount() sea llamado
    Lex.useClient(() => {
        divRef.current.appendChild(<h1>
            Contenido dinámico agregado en el cliente
        </h1>)
    });

    return content;
}

Lex.mount(<MyComponent />);
```

#### Cómo Funciona

0. **Fase de Build**: Cuando se construye con `buildHTML`, se ejecuta el código en un sandbox basado en el valor recibido en `mount()`. Cada elemento HTML se marca con un `lexid` para ser seleccionado en la siguiente fase.
1. **Fase de Hidratación**: Ya en el cliente, durante el renderizado inicial, LEX usa `document.querySelector` para encontrar elementos existentes con atributos `lexid`
2. **Fase Cliente**: Después de que `mount()` es llamado, LEX cambia a usar `document.createElement` para nuevos elementos
3. **Control de Ejecución**: Todos los callbacks de `useClient` son encolados y ejecutados solo cuando `mount()` es llamado

### Hidratación con lexid

LEX incluye un sistema de hidratación incorporado usando el atributo `lexid`. Esta prop se agrega automáticamente a todos los elementos generados por LEX para habilitar la creación selectiva de elementos y la hidratación.

Cuando LEX crea elementos, asigna un `lexid` único a cada uno. Si un elemento con el mismo `lexid` ya existe en el DOM (creado por el constructor y presente en el HTML), LEX seleccionará y reutilizará ese elemento existente en lugar de crear uno nuevo.

Este enfoque de hidratación te permite:
- Pre-renderizar componentes en el servidor
- Hidratarlos en el cliente sin recrear todo el DOM
- Mantener el estado y los event listeners eficientemente

```jsx
// Si este HTML ya existe en el DOM:
// <div lexid="0"><h1 lexid="1">Hola Mundo</h1></div>

const MyComponent = () => {
    return <div>
        <h1>Hola Mundo</h1>
    </div>
}

// LEX seleccionará los elementos existentes en lugar de crear nuevos
```

#### Nota Importante

El sistema `lexid` funciona automáticamente - no necesitas gestionar manualmente estos IDs. LEX-BUILDER y LEX maneja la asignación y la lógica de selección internamente para asegurar una hidratación apropiada.

## Builder

Puedes compilar con esbuild, por ejemplo, simplemente cambiando el JSXFactory a `Lex.createElement`. Sin embargo, he desarrollado un constructor disponible en este mismo repositorio:

### build-html

Si estás comenzando y quieres compilar a HTML, este es el módulo más sencillo.

```js
const buildHTML = require("@lek-js/build-html");

const options = { minify:true, write:true, outfile: "output.html" };

buildHTML.byStringCode(stringCode, codeVirtualPath, options);
buildHTML.standart("entry-point.jsx", options);
buildHTML.layout("layout.jsx", "page.jsx", options);
```
Con `byStringCode` puedes procesar el JavaScript desde un string y el path virtual del archivo para resolver rutas relativas. Es para uso más fino que los siguientes.

Con `standart` debes declarar todo el código JSX incluyendo el layout y el montaje del componente principal, así como la llamada a `Lex.mount()` en un archivo y pasar el path como argumento:

```jsx
import Lex from "@lek-js/lex";
Lex.mount(<html>
    <head>bla bla bla</head>
    <body>bla bla bla</body>
<html>);
```
Se recibirá un HTML como output.

Con `layout` admite un archivo `layout.jsx` y un archivo `page.jsx` al estilo de Next.js:

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
        <h1>Hola mundo!</h1>
    </main>
}
export default Page;
```
Por defecto el builder compilará basado en

```jsx
Lex.mount(<Layout><Page /></Layout>);
```

#### Opciones de Configuración

- **`minify`**: Minimifica o no el JavaScript dentro del HTML
- **`write`**: Si es `true`, escribe en el disco basado en la opción `outfile`. Si es `false`, retorna el código como string
- **`outfile`**: Para cuando `write` es `true`

### build-jsx

También tiene una versión `standart`, `layout` y `byStringCode`, pero retorna el JavaScript para cliente sin HTML.

Esto es para integración con frameworks o control más avanzado. Hay que asegurarse de hidratar bien el HTML.

## ¿Por qué LEX?

He estado desarrollando con React por mucho tiempo y realmente me gusta su sintaxis. Creo que es una librería muy poderosa. Sin embargo, he estado reflexionando sobre proyectos pequeños y medianos que realmente no necesitan un DOM virtual o la sobrecarga de funciones en cascada y reconciliación del DOM con el DOM virtual.

Leyendo la comunidad, he escuchado a muchas personas preguntando por algo como JSX para que sea parte del estándar web. La cosa es que JSX es muy seductivo, visualmente semántico, y evita anidar elementos infinitos como tienes que hacer en JavaScript vanilla. Esta es mi propuesta para generar una especie de "vanilla.jsx".

LEX es extremadamente ligero y opera directamente en el DOM.