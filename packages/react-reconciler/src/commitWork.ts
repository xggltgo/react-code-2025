import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffect: FiberNode | null = null; // 当前需要处理Effect的FiberNode

const getHostParent = (finishedWork: FiberNode) => {
	let parent = finishedWork.return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode; // 返回宿主环境对应的节点 DOM
		} else if (parentTag === HostRoot) {
			return parent.stateNode.container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到 host parent', finishedWork);
	}
	return null;
};

const appendPlacementNodeIntoContainer = (finishedWork: FiberNode, hostParent: Container) => {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行Placement操作,当前处理的finishedWork节点：', finishedWork);
	}
	// 父级宿主环境对应的节点 DOM
	const hostParent = getHostParent(finishedWork);
	// append finishedWork宿主环境对应的节点 DOM
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
	// 其他 flags 的处理
};

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;
	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;
		if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
			nextEffect = child;
		} else {
			// 向上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};
