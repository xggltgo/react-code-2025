import { Action } from 'shared/ReactTypes';

export type Dispatch<State> = (action: Action<State>) => void;

export interface Dispatcher {
	useState: <State>(ininitialState: State | (() => State)) => [State, Dispatch<State>];
}

const currentDispatcher: {
	current: Dispatcher | null;
} = {
	current: null
};

export const resloveDispatcher = (): Dispatcher => {
	const dispatcher = currentDispatcher.current;
	if (dispatcher === null) {
		throw new Error('hook can only be call in a function component');
	}
	return dispatcher;
};

export default currentDispatcher;
