import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatch } from 'react/src/currentDispatcher';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

const { currentDispatcher } = internals;
let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

const mountWorkInProgressHook = (): Hook => {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		// This is the first hook in the list
		if (currentlyRenderingFiber === null) {
			throw new Error('Hooks can only be called inside a function component');
		}
		workInProgressHook = hook;
		currentlyRenderingFiber.memoizedState = workInProgressHook;
	} else {
		// This is not the first hook in the list
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}

	return workInProgressHook;
};

const dispatchSetState = <State>(fiber: FiberNode, updateQueue: UpdateQueue<State>, action: Action<State>) => {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

const mountState = <State>(initialState: State | (() => State)): [State, Dispatch<State>] => {
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	}else {
		memoizedState = initialState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

export const renderWithHooks = (wip: FiberNode) => {
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;
	const current = wip.alternate;

	if (current !== null) {
		// update
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;

	return children;
};
