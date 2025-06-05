export type Container = Element;
export type Instance = Element;

/**
 * 创建一个新的实例 DOM
 */
export const createInstance = (type: string, props: any): Instance => {
	// TODO: 处理 props
	const element = document.createElement(type);
	return element;
};

/**
 * 将实例 DOM 插入到父容器中
 */
export const appendInitialChild = (parent: Container | Instance, child: Instance) => {
	parent.appendChild(child);
};

/**
 * 创建文本实例
 */
export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;
