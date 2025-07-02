import { Props, ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, createWorkInProgress, FiberNode } from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

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

	const reconcileSingleElement = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) => {
		if (currentFiber !== null) {
			// update
			const elementKey = element.key;
			const elementType = element.type;
			if (currentFiber.key === elementKey) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === elementType) {
						// type和key都匹配，复用
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						return existing;
					} else {
						// type不匹配，删除旧的fiber
						removeOldFiber(returnFiber, currentFiber);
					}
				} else {
					if (__DEV__) {
						console.warn('未实现的react类型', element);
					}
				}
			} else {
				// key不匹配，删除旧的fiber
				removeOldFiber(returnFiber, currentFiber);
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
		if (currentFiber !== null) {
			// update
			if (currentFiber.type === HostText) {
				// type匹配，复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			} else {
				removeOldFiber(returnFiber, currentFiber);
			}
		}
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
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
		}

		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(reconcileTextNode(returnFiber, currentFiber, newChild));
		}

		// TODO 多节点的情况

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
