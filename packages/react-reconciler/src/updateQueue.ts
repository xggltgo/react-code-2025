import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import { Lane, NoLane } from './fiberLanes';

// 定义原子级别的更新的数据结构
export type Update<State> = {
	action: Action<State>;
	lane: Lane;
	next: Update<any> | null;
};

// 定义消费原子级别更新的数据结构
export type UpdateQueue<State> = {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
};

// 创建一个原子级别的更新
export const createUpdate = <State>(action: Action<State>, lane: Lane): Update<State> => {
	return { action, lane, next: null };
};

// 创建一个消费原子级别更新的队列？
export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	return { shared: { pending: null }, dispatch: null };
};

// 向更新队列中添加一个更新
export const enqueueUpdate = <State>(updateQueue: UpdateQueue<State>, update: Update<State>) => {
	const pending = updateQueue.shared.pending;
	if (pending === null) {
		// pending = a -> a
		update.next = update;
	} else {
		// pending = b -> a -> b
		// pending = c -> a -> b -> c
		// pending = d -> a -> b -> c -> d
		update.next = pending.next;
		pending.next = update;
	}
	updateQueue.shared.pending = update;
};

// 处理更新队列
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
	renderLane: Lane
): {
	memoizedState: State;
} => {
	const result: ReturnType<typeof processUpdateQueue<State>> = { memoizedState: baseState };
	if (pendingUpdate !== null) {
		const first = pendingUpdate.next;
		let pending = pendingUpdate.next as Update<any>;
		do {
			const updateLane = pending.lane;
			if (updateLane === renderLane) {
				const action = pending.action;
				if (action instanceof Function) {
					baseState = action(baseState);
				} else {
					baseState = action;
				}
			} else {
				if (__DEV__) {
					console.log('不应该进入updateLane !== renderLane逻辑');
				}
			}
			pending = pending.next as Update<any>;
		} while (pending !== first);
	}
	result.memoizedState = baseState;
	return result;
};
