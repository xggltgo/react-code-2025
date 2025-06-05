import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

const prepareFreshStack = (fiberRootNode: FiberRootNode) => {
	workInProgress = createWorkInProgress(fiberRootNode.current, {});
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
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;
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
		console.log('commit阶段开始', finishedWork);
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

export const renderRoot = (fiberRootNode: FiberRootNode) => {
	// 初始化
	prepareFreshStack(fiberRootNode);

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

	// 得到了一颗带有flags的新的 fiber 树
	const finishedWork = fiberRootNode.current.alternate;
	fiberRootNode.finishedWork = finishedWork;

	commitRoot(fiberRootNode);
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
	return null;
};

export const scheduleUpdateOnFiber = (fiber: FiberNode) => {
	// TODO 调度更新
	const fiberRootNode = markUpdateFromFiberToRoot(fiber);
	renderRoot(fiberRootNode);
};
