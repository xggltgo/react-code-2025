export const beginWork = (workInProgress: FiberNode) => {
	// 比较，返回子FiberNode
	console.log('beginWork', workInProgress);
};
