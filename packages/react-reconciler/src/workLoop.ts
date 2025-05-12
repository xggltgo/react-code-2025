import { beginWork } from './beginWork';
import { completeWork } from './complateWork';
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

export const renderRoot = (rootFiber: FiberRootNode) => {
	// 初始化
	prepareFreshStack(rootFiber);

	do {
		try {
			workLoop();
			break;
		} catch (error) {
			console.error('workLoop error', error);
		}
	} while (true);
};

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
	// 找到 React 应用对应的 fiberRootNode 节点
	const rootFiberNode = markUpdateFromFiberToRoot(fiber);
	renderRoot(rootFiberNode);
};
