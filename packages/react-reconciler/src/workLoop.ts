import { beginWork } from './beginWork';
import { completeWork } from './complateWork';
import { FiberNode } from './fiber';

let workInProgress: FiberNode | null = null;

const prepareFreshStack = (rootFiber: FiberNode) => {
	workInProgress = rootFiber;
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

export const renderRoot = (rootFiber: FiberNode) => {
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
