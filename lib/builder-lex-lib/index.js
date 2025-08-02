import Lex from "../lex";

Lex.useClient = (handler) => { /*Ignoramos en build*/ };
Lex.startClient(); //ejecutamos para que se generen los elementos en build
Lex.startClient = () => { /*Ignoramos en build*/ }; //inutilizamos la función en build


export const useClient = Lex.useClient;
export const Fragment = Lex.Fragment;
export const startClient = Lex.startClient;

export const createElement = Lex.createElement;
export const useRef = Lex.useRef;
export const useState = Lex.useState;
export const State = Lex.State;
export default Lex;