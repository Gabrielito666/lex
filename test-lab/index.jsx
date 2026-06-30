import Lex, {useState, useRef} from "@lek-js/lex";

const Layout = ({ children }) => <html>
	<head>

	</head>
	<body>
		{children}
	</body>
</html>

const Counter = () =>
{
	const [count, setCount] = useState(0);

	return <article>
		<h3>Contador</h3>
		<p>Su numero es: <span>{count}</span></p>
		<button onClick={() => {setCount(count+1)}}>Incrementar</button>
	</article>
}

const ButtonAndInput = () =>
{
	const inputRef = useRef();
	
	const onClick = () =>
	{
		console.log("el input dice:", inputRef.current.value);
	}

	return <section>
		<label>Nombre: <input type="text" ref={inputRef}/></label>
		<button onClick={onClick}>Enviar</button>
	</section>

}

const ComponentWithDifferentCalls = () =>
{
	const miInput = <input type="text" selectSelf/>;

	return <aside>
		<h4>Prueba con llamadas en diferentes partes</h4>
		{miInput}
		<button onClick={() => { console.log(miInput.value) }}>Enviar</button>
	</aside>
	
}

const Page = () => {
	return <main>
		<h1>Primera prueba de refactor</h1>
		<Counter/>
		<Counter/>
		<ButtonAndInput/>
		<ComponentWithDifferentCalls/>
	</main>
}

Lex.mount(<Layout><Page/></Layout>);
