import Lex from "../lex";

Lex.useClient = (handler) => { /*Ignoramos en build*/ };
Lex.startClient(); //ejecutamos para que se generen los elementos en build
Lex.mount = (mainComponent) => {
    //EN JSDOM se añade a body para renderizar html
    document.body.appendChild(mainComponent);
};

export const useClient = Lex.useClient;
export const Fragment = Lex.Fragment;
export const mount = Lex.mount;

export const createElement = Lex.createElement;
export const useRef = Lex.useRef;
export const useState = Lex.useState;
export const State = Lex.State;
export default Lex;