import Lex from "@lek-js/lex";

const Page = () =>
{
    const [count, setCount] = Lex.useState(0);
    return <div>
        <h1>Hello, world!</h1>

        <h2>{count}</h2>

        <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>;
}

export default Page;