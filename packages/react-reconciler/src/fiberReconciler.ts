import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

// ReactDOM.createRoot(document.getElementById('root')).render(<App />)

/**
 * 创建 hostRootFiber（宿主环境挂载点对应的FiberNode）和  fiberRootNode（React应用对应的FiberNode），并建立两者之间的联系
 * 该函数会在 ReactDOM.createRoot() 中调用
 */
export const createContainer = (container: Container) => {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const fiberRootNode = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue(); // 初始化 hostRootFiber 的更新队列
	return fiberRootNode;
};

// 更新流程入口
export const updateContainer = (element: ReactElementType, fiberRootNode: FiberRootNode) => {
    const hostRootFiber = fiberRootNode.current;
    const update = createUpdate<ReactElementType | null>(element);
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update); // 将更新添加到更新队列中
    scheduleUpdateOnFiber(hostRootFiber); // 调度更新
    return element;
};
