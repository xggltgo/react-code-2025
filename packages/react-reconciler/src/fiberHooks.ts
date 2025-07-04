import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

interface Hook {
	memoizedState: any; // 存储当前 HooK 的状态
	updateQueue: unknown;
	next: Hook | null; // 连接下一个 HooK
}

const { currentDispatcher } = internals;
let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

const mountWorkInProgressHook = (): Hook => {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		// 当前是否存在正在处理的 FunctionComponent FiberNode
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

const updateWorkInProgressHook = (): Hook => {
	// TODO：render阶段触发的更新
	let nextCurrentHook: Hook | null = null;
	if (currentHook === null) {
		// FC update 的第一个 Hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		// FC update 的后续 Hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		throw new Error('FC hook number exceeds the number of hooks in the current component');
	}

	currentHook = nextCurrentHook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		// mount 的第一个 Hook
		if (currentlyRenderingFiber === null) {
			throw new Error('Hooks can only be called inside a function component');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount 的后续 Hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
};

const dispatchSetState = <State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) => {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
};

const mountState = <State>(initialState: State | (() => State)): [State, Dispatch<State>] => {
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
};

const updateState = <State>(): [State, Dispatch<State>] => {
	const hook = updateWorkInProgressHook();
	// 计算新的 state
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
		hook.memoizedState = memoizedState;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

/**
 *
 */
export const renderWithHooks = (wip: FiberNode) => {
	currentlyRenderingFiber = wip; // 记录当前正在处理的 FunctionComponent FiberNode
	wip.memoizedState = null; // TODO：这是干嘛用的,重置hooks链表？
	const current = wip.alternate;

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;

	return children;
};
