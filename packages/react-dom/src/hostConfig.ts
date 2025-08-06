import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTags';
import { DOMElement, updateFiberProps } from './SyntheticEvent';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

/**
 * 创建一个新的实例 DOM
 */
export const createInstance = (type: string, props: any): Instance => {
	// TODO: 处理 props
	const element = document.createElement(type) as unknown;
	updateFiberProps(element as DOMElement, props);
	return element as DOMElement;
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

export const commitTextUpdate = (textInstance: TextInstance, content: string) => {
	textInstance.textContent = content;
};

export const commitUpdate = (fiber: FiberNode) => {
	switch (fiber.tag) {
		case HostText: {
			const text = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, text);
		}
		default:
			if (__DEV__) {
				console.warn('未实现的Update类型', fiber);
			}
			break;
	}
};

export const removeChild = (child: Instance | TextInstance, container: Container) => {
	container.removeChild(child);
};

export const insertChildToContainer = (child: Instance, container: Container, before: Instance) => {
	container.insertBefore(child, before);
};
