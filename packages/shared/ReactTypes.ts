export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	type: Type; // 这里的类型到底是Type还是ElementType呢？
	key: Key;
	ref: Ref;
	props: Props;
	__owner: string;
}

export type Action<State> = State | ((prevState: State) => State);
