import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

// 实现 FiberNode 数据结构（一种介于 ReactElement 和 DomElement 之间的数据结构）
export class FiberNode {
	// 实例变量
	tag: WorkTag; // 节点类型
	key: Key;
	stateNode: any; // 节点对应的 DOM 节点
	type: any;
	ref: Ref;

	// 节点关系
	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number; // 节点在兄弟节点中的索引

	// 工作单元
	pendingProps: Props; // 待处理的属性
	memoizedProps: Props | null; // 已处理的属性
	memoizedState: any; // 已处理的状态
	alternate: FiberNode | null; // 交替节点
	flags: Flags; // 当前节点的副作用
	subtreeFlags: Flags; // 子树的副作用
	updateQueue: unknown; // 更新队列
	deletions: FiberNode[] | null; // 待删除的子节点

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;
		this.ref = null;

		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.alternate = null;
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.updateQueue = null;
		this.deletions = null;
	}
}

// 实现 FiberRootNode 数据结构（React 应用对应的 FiberNode）
export class FiberRootNode {
	container: Container; // React 应用挂载的宿主环境对应的节点
	current: FiberNode; // 指向 宿主环境挂载点对应的 FiberNode （hostRootFiber）
	finishedWork: FiberNode | null; // 已完成 workLoop 更新流程的 FiberNode

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		// 关联 FiberRootNode 和 hostRootFiber
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;

		this.finishedWork = null;
	}
}

/**
 * 创建 currentFiber 对应的 wip FiberNode
 */
export const createWorkInProgress = (currentFiber: FiberNode, pendingProps: Props): FiberNode => {
	let wip = currentFiber.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(currentFiber.tag, pendingProps, currentFiber.key);
		wip.alternate = currentFiber;
		currentFiber.alternate = wip;
		wip.stateNode = currentFiber.stateNode;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = currentFiber.type;
	wip.memoizedProps = currentFiber.memoizedProps;
	wip.memoizedState = currentFiber.memoizedState;
	wip.updateQueue = currentFiber.updateQueue;

	return wip;
};

export const createFiberFromElement = (element: ReactElementType): FiberNode => {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.log('invalid type', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
};
