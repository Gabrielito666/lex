export interface State
{
    _value:any;
    onChangesStack: (() => void)[];
    get():any;
    set(newValue:any):void;
    valueOf():any;
    toString():string;
    appendOnChange(fn: () => void):void;
}
export interface StateClass
{
    new(initValue: any): State;
}
export type UseState = (initValue: any) => [State, (newValue: any) => void];
export type UseRef = (initValue: any) => { current: any };
export type FragmentComponent = (props: { children: any }) => any;
export type CreateElement = (tag: string | Function, props: any, ...children: any[]) => any;
export type UseClient = (handler: () => void) => void;
export type StartClient = () => void;
export type Lex = {
    createElement: CreateElement,
    State: StateClass,
    useState: UseState,
    useRef: UseRef,
    Fragment: FragmentComponent,
    useClient: UseClient,
    startClient: StartClient
};