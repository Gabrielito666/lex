import Lex, { useState, useRef } from "../index.js";

const Counter = () =>
{

    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const clickHandler = () => { setCount(count + 1); console.log(ref.current.textContent) };
    
    return <div>
        <h1 ref={ref}>numero: {count}</h1>
        <button onClick={clickHandler}>increment</button>
    </div>
}
const Main = ({children}) => <main>{children}</main>;

const Counters = () => <>
    <Counter />
    <Counter />
    <Counter />
    <Counter />
</>

console.log(<Main><Counters /></Main>);

document.querySelector("body").appendChild(<Main><Counters /></Main>);