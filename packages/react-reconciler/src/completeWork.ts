import { appendInitialChild, Container, createInstance, createTextInstance } from 'hostConfig';
import { FiberNode } from './fiber';
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags, Update } from './fiberFlags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

const appendAllChildren = (parent: Container, wip: FiberNode) => {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			// 如果有子节点，递归处理
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			// 如果当前节点是wip本身，说明已经处理完所有子节点
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				// 如果没有兄弟节点，且返回的父节点是wip本身，说明已经处理完所有节点
				return;
			}
			node = node.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
};

/**
 * 将子节点的副作用标记向上传递到父节点（收集后代节点的副作用标记）
 */
const bubbleProperties = (wip: FiberNode) => {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;
		// child.return = wip; // DEL
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
};

const markUpdate = (fiber: FiberNode) => {
	fiber.flags |= Update; // 标记为更新
};

export const completeWork = (wip: FiberNode) => {
	switch (wip.tag) {
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case HostComponent:
			if (wip.alternate !== null && wip.stateNode) {
				// 更新阶段
				updateFiberProps(wip.stateNode, wip.memoizedProps);
			} else {
				// 初始渲染阶段
				// 1. 创建HostComponent对应的DOM节点
				const instance = createInstance(wip.type, wip.memoizedProps);
				// 2. 将HostComponent的子节点的DOM节点插入到HostComponent的DOM节点中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (wip.alternate !== null && wip.stateNode) {
				// 更新阶段
				const oldText = wip.alternate.memoizedProps.content;
				const newText = wip.pendingProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// 初始渲染阶段
				const instance = createTextInstance(wip.pendingProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		case Fragment:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn(`未处理的completeWork类型 ${wip.tag}`);
			}
	}
};
