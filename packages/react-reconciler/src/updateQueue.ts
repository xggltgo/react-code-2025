import { Action } from 'shared/ReactTypes';

// 定义原子级别的更新的数据结构
export type Update<State> = {
	action: Action<State>;
};

// 定义消费原子级别更新的数据结构
export type UpdateQueue<State> = {
	shared: {
		pending: Update<State> | null;
	};
};

// 创建一个原子级别的更新
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return { action };
};

// 创建一个消费原子级别更新的队列？
export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	return { shared: { pending: null } };
};

// 向更新队列中添加一个更新
export const enqueueUpdate = <State>(updateQueue: UpdateQueue<State>, update: Update<State>) => {
	updateQueue.shared.pending = update;
};

// 处理更新队列
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): {
	memoizedState: State;
} => {
	const result: ReturnType<typeof processUpdateQueue<State>> = { memoizedState: baseState };
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}
	return result;
};
