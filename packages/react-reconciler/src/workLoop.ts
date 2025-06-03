import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
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
		workInProgress = performUnitOfWork(workInProgress);
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
