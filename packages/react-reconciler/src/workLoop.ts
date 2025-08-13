import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';
import {
	getHighestPriorityLane,
	Lane,
	markRootFinished,
	mergeLanes,
	NoLane,
	SyncLane
} from './fiberLanes';
import { flushSyncCallbacks, scheduleSyncCallback } from './syncTaskQueue';
import { scheduleMicroTask } from 'hostConfig';

let workInProgress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane;

const prepareFreshStack = (fiberRootNode: FiberRootNode, lane: Lane) => {
	workInProgress = createWorkInProgress(fiberRootNode.current, {});
	wipRootRenderLane = lane;
};

const completeUnitOfWork = (fiber: FiberNode) => {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
};

const performUnitOfWork = (fiber: FiberNode) => {
	const next = beginWork(fiber, wipRootRenderLane);
	fiber.memoizedProps = fiber.pendingProps; // DEL
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
};

const workLoop = () => {
	while (workInProgress) {
		performUnitOfWork(workInProgress);
	}
};

const commitRoot = (fiberRootNode: FiberRootNode) => {
	const finishedWork = fiberRootNode.finishedWork;
	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.log('commit阶段开始,完整的且带有副作用的 wip fiberNode 树：', finishedWork);
	}
	fiberRootNode.finishedWork = null;

	// 判断是否存在三个子阶段 beforeMutation, mutation, layout 需要执行的操作
	// fiberRootNode flags 和 fiberRootNode subtreeFlags
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	const subTreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	if (rootHasEffect || subTreeHasEffect) {
		// beforeMutation 阶段

		// mutation 阶段
		commitMutationEffects(finishedWork);
		fiberRootNode.current = finishedWork;

		// layout 阶段
	} else {
		fiberRootNode.current = finishedWork;
	}
};

/**
 * 根据当前 fiber 节点，向上查找，直到找到 React 应用对应的 fiberRootNode 节点
 * @param fiber
 * @returns
 */
const markUpdateFromFiberToRoot = (fiber: FiberNode) => {
	let node = fiber;
	while (node.return !== null) {
		node = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	// return null; // DEL
};

const markRootUpdated = (root: FiberRootNode, lane: Lane) => {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane);
};

const performSyncWorkOnRoot = (fiberRootNode: FiberRootNode, lane: Lane) => {
	const nextLane = getHighestPriorityLane(fiberRootNode.pendingLanes);
	if (nextLane !== SyncLane) {
		// 调度其他比SyncLane优先级更低的工作
		ensureRootIsScheduled(fiberRootNode);
		return;
	}
	if (__DEV__) {
		console.log('render阶段开始');
	}
	prepareFreshStack(fiberRootNode, lane);

	do {
		try {
			workLoop();
			break;
		} catch (error) {
			if (__DEV__) {
				console.error('workLoop error', error);
			}
		}
	} while (true);

	const finishedWork = fiberRootNode.current.alternate;
	fiberRootNode.finishedWork = finishedWork;
	fiberRootNode.finishedLane = lane;
	wipRootRenderLane = NoLane;

	commitRoot(fiberRootNode);

	const _lane = fiberRootNode.finishedLane;
	if (_lane === NoLane && __DEV__) {
		console.warn('lane 不应该为 NoLane');
	}
	fiberRootNode.finishedWork = null;
	fiberRootNode.finishedLane = NoLane;
	markRootFinished(fiberRootNode, _lane);
};

const ensureRootIsScheduled = (fiberRootNode: FiberRootNode) => {
	const updateLane = getHighestPriorityLane(fiberRootNode.pendingLanes);
	if (updateLane === NoLane) {
		return;
	}
	if (updateLane === SyncLane) {
		if (__DEV__) {
			console.log('微任务调度同步更新');
		}
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, fiberRootNode, updateLane));
		scheduleMicroTask(flushSyncCallbacks);
	} else {
		if (__DEV__) {
			console.log('宏任务调度异步更新');
		}
	}
};

/**
 * 向上查找，直到找到 React 应用对应的 fiberRootNode 节点，开启更新流程
 */
export const scheduleUpdateOnFiber = (fiber: FiberNode, lane: Lane) => {
	// TODO 调度更新
	const fiberRootNode = markUpdateFromFiberToRoot(fiber);
	markRootUpdated(fiberRootNode, lane);
	ensureRootIsScheduled(fiberRootNode);
};
