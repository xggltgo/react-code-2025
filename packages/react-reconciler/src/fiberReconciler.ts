import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

/**
 * 创建 fiberRootNode（React 应用对应的FiberNode）和 hostRootFiber（宿主环境挂载点对应的FiberNode），并建立两者之间的联系
 * 该函数会在 ReactDOM.createRoot() 中调用
 */
export const createContainer = (container: Container) => {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const fiberRootNode = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue(); // 初始化hostRootFiber的更新队列
	return fiberRootNode;
};

export const updateContainer = (element: ReactElementType, fiberRootNode: FiberRootNode) => {
    const hostRootFiber = fiberRootNode.current;
    const update = createUpdate<ReactElementType | null>(element); // 这里传承不应该是action吗？
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update); // 将更新添加到更新队列中
    scheduleUpdateOnFiber(hostRootFiber); // 调度更新
    return element;
};
