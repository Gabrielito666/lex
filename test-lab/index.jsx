import Lex, {useState, useRef, useClient} from "@lek-js/lex";
import "./css-1.css";

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
	const miInput = <input type="text" __keep/>;

	return <aside>
		<h4>Prueba con llamadas en diferentes partes</h4>
		{miInput}
		<button onClick={() => { console.log(miInput.value) }}>Enviar</button>
	</aside>
	
}

const Loader = () =>
{
	const loaderRef = useRef();
	window.addEventListener("load", () =>
	{
		setTimeout(() => { loaderRef.current?.remove() }, 3000);
	});

	return <section ref={loaderRef}>
		<h1>loadding...</h1>
	</section>;
}

const useAlert = () => 
{
	const alert = <h1 __keep hidden>Alerta!!</h1>;

	const Component = () => alert;

	const start = () =>
	{
		alert.hidden = false;
	}
	const stop = () =>
	{
		alert.hidden = true;
	}
	return [Component, start, stop]
}

const Page = () =>
{

	useClient(() =>
	{
		console.log("Este console.log solo debería verse en el navegador y no en terminal al buildeal");
	});

	console.log("Este console.log debería verse en el navegador y en la terminal al buildeal");

	const [Alert, startAlert, stopAlert] = useAlert();

	return <main>
		<h1>Primera prueba de refactor</h1>
		<Counter/>
		<Counter/>
		<ButtonAndInput/>
		<ComponentWithDifferentCalls/>
		<Loader/>
		<button onClick={startAlert}>Activar alerta</button>
		<button onClick={stopAlert}>Desactivar alerta</button>
		<Alert/>
	</main>
}

Lex.mount(<Layout><Page/></Layout>);
