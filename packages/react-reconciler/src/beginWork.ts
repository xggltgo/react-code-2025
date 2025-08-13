import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';
import { Lane } from './fiberLanes';

export const beginWork = (wip: FiberNode, renderLane: Lane) => {
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip, renderLane);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip, renderLane);
		case Fragment:
			return updateFragment(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork: unhandled unit of work type', wip.tag);
			}
			return null;
	}
};

const reconcileChildren = (wip: FiberNode, childReactElement: ReactElementType) => {
	const current = wip.alternate;
	if (current !== null) {
		// 更新阶段
		wip.child = reconcileChildFibers(wip, current?.child, childReactElement);
	} else {
		// 初始渲染阶段
		wip.child = mountChildFibers(wip, null, childReactElement);
	}
};

const updateHostRoot = (wip: FiberNode, renderLane: Lane) => {
	// 计算新的状态
	const baseState = wip.memoizedState;
	const pendingUpdate = (wip.updateQueue as UpdateQueue<ReactElementType>).shared.pending;
	const { memoizedState } = processUpdateQueue(baseState, pendingUpdate, renderLane);
	wip.memoizedState = memoizedState;
	(wip.updateQueue as UpdateQueue<ReactElementType>).shared.pending = null;
	const childReactElement = wip.memoizedState;
	// 创建新的子节点
	reconcileChildren(wip, childReactElement);
	return wip.child;
};

const updateHostComponent = (wip: FiberNode) => {
	// 无需计算新的状态，仅创建新的子节点
	const childReactElement = wip.pendingProps.children;
	reconcileChildren(wip, childReactElement);
	return wip.child;
};

const updateFunctionComponent = (wip: FiberNode, renderLane: Lane) => {
	const nextChildren = renderWithHooks(wip, renderLane);
	reconcileChildren(wip, nextChildren);
	return wip.child;
};

const updateFragment = (wip: FiberNode) => {
    const nextChildren = wip.pendingProps;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}