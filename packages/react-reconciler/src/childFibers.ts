import { Props, ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, createWorkInProgress, FiberNode } from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

type ExistingChildren = Map<string | number, FiberNode>;

const ChildReconciler = (shouldTrackEffects: boolean) => {
	const placeSingleChild = (fiber: FiberNode) => {
		if (shouldTrackEffects && fiber.alternate === null) {
			// TODO: 需要听一下
			fiber.flags |= Placement;
		}
		return fiber;
	};

	const removeOldFiber = (returnFiber: FiberNode, oldFiber: FiberNode) => {
		if (!shouldTrackEffects) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [oldFiber];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(oldFiber);
		}
	};

	const useFiber = (fiber: FiberNode, pendingProps: Props) => {
		const clone = createWorkInProgress(fiber, pendingProps);
		clone.index = 0;
		clone.sibling = null;
		return clone;
	};

	const removeRemainingChildren = (returnFiber: FiberNode, currentFirstChild: FiberNode | null) => {
		if (!shouldTrackEffects) {
			return;
		}
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			removeOldFiber(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	};

	const reconcileSingleElement = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) => {
		while (currentFiber !== null) {
			// update
			const elementKey = element.key;
			const elementType = element.type;
			if (currentFiber.key === elementKey) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === elementType) {
						// type和key都匹配，复用
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						// 当前节点复用，需要删除其余的兄弟节点
						removeRemainingChildren(returnFiber, currentFiber.sibling);
						return existing;
					} else {
						// type不匹配，移除所有同级节点
						removeRemainingChildren(returnFiber, currentFiber);
					}
				} else {
					if (__DEV__) {
						console.warn('未实现的react类型', element);
					}
				}
			} else {
				// key不匹配，移除当前节点，继续遍历兄弟节点
				removeOldFiber(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	};

	const reconcileTextNode = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string
	) => {
		while (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				// tag匹配，复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				// 当前节点复用，需要删除其余的兄弟节点
				removeRemainingChildren(returnFiber, currentFiber.sibling);
				return existing;
			} else {
				// type不匹配，移除当前节点，继续遍历兄弟节点
				removeOldFiber(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	};

	const updateFromMap = (
		returnFiber: FiberNode,
		existingChildren: ExistingChildren,
		index: number,
		element: any
	) => {
		const keyToUse = element.key !== null ? element.key : index;
		const before = existingChildren.get(keyToUse);
		// HostText
		if (typeof element === 'string' || typeof element === 'number') {
			if (before) {
				if (before.tag === HostText) {
					existingChildren.delete(keyToUse);
					return useFiber(before, { content: element + '' });
				}
			}
		}
		// ReactElement
		if (typeof element === 'object' && element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE:
					if (before) {
						if (before.type === element.type) {
							existingChildren.delete(keyToUse);
							return useFiber(before, element.props);
						}
					}
					return createFiberFromElement(element);
			}
			// TODO: 数组类型
			if (Array.isArray(element) && __DEV__) {
				console.warn('数组类型还未实现');
			}
		}
		return null;
	};

	const reconcileChildrenArray = (
		returnFiber: FiberNode,
		currentFirstFiber: FiberNode | null,
		newChildren: any[]
	) => {
		let lastPlacedIndex = 0; // 最后一个可复用的current fiberNode节点索引
		let lastNewFiber = null; // 最后一个新创建的fiberNode节点
		let firstNewFiber = null; // 第一个新创建的fiberNode节点

		// 1. 将 currentFiber 链表转换为 Map
		const existingChildren: ExistingChildren = new Map();
		let current = currentFirstFiber;
		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}

		// 2. 遍历 newChildren，尝试复用 currentFiber 节点
		for (let i = 0; i < newChildren.length; i++) {
			const after = newChildren[i];
			const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
			if (newFiber === null) {
				continue;
			}
			newFiber.index = i;
			newFiber.return = returnFiber;

			// 3. 标记移动还是插入
			if (lastNewFiber === null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}

			if (!shouldTrackEffects) {
				continue;
			}
			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					// 移动
					newFiber.flags |= Placement;
					continue;
				} else {
					lastPlacedIndex = oldIndex;
				}
			} else {
				// mount
				newFiber.flags |= Placement;
			}
		}

		// 4. Map中剩余节点标记删除
		existingChildren.forEach((child) => {
			removeOldFiber(returnFiber, child);
		});

		return firstNewFiber;
	};

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElementType
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild));
				default:
					if (__DEV__) {
						console.warn('reconcileChildFibers: unhandled unit of work type', newChild.$$typeof);
					}
					break;
			}
			// 多节点的情况
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			}
		}

		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(reconcileTextNode(returnFiber, currentFiber, newChild));
		}

		if (currentFiber !== null) {
			removeOldFiber(returnFiber, currentFiber);
		}

		if (__DEV__) {
			console.warn('reconcileChildFibers: unhandled unit of work type', newChild);
		}
		return null;
	};
};

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
