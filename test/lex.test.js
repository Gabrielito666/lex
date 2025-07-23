import Lex, { useState } from "../index.js";

const Counter = () =>
{

    const [count, setCount] = useState(0);

    const clickHandler = () => { setCount(count + 1) };

    return <div>
        <h1>numero: {count}</h1>
        <button onClick={clickHandler}>increment</button>
    </div>
}
const Main = ({children}) => <main>{children}</main>;

const Counters = () => <div>
    <Counter />
    <Counter />
    <Counter />
    <Counter />
</div>

console.log(<Main><Counters /></Main>);

document.querySelector("body").appendChild(<Main><Counters /></Main>);