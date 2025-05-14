import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Type, Key, Props, ReactElementType, Ref, ElementType } from 'shared/ReactTypes';

/**
 * 实现 ReactElement 数据结构
 */
const ReactElement = (type: Type, key: Key, ref: Ref, props: Props): ReactElementType => {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__owner: 'Locke'
	};
	return element;
};

/**
 * 实现 jsx 函数，用于创建 ReactElement
 */
export const jsx = (type: ElementType, config: any, ...restChildren: any) => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;
	for (const prop in config) {
		const value = config[prop];
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + value;
			}
		} else if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
		} else {
			if ({}.hasOwnProperty.call(config, prop)) {
				props[prop] = value;
			}
		}
	}
	const restChildrenLength = restChildren.length;
	if (restChildrenLength) {
		if (restChildrenLength === 1) {
			props.children = restChildren[0];
		} else {
			props.children = restChildren;
		}
	}
	return ReactElement(type, key, ref, props);
};

/**
 * 实现 jsxDEV 函数，用于开发环境下创建 ReactElement
 */
export const jsxDEV = (type: ElementType, config: any) => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;
	for (const prop in config) {
		const value = config[prop];
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + value;
			}
		} else if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
		} else {
			if ({}.hasOwnProperty.call(config, prop)) {
				props[prop] = value;
			}
		}
	}
	return ReactElement(type, key, ref, props);
};
