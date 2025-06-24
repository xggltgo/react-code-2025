import { ReactElementType } from "shared/ReactTypes";
import { createFiberFromElement, FiberNode } from "./fiber";
import { Placement } from "./fiberFlags";
import { HostText } from "./workTags";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

const ChildReconciler = (shouldTrackEffects: boolean) => {
	const placeSingleChild = (fiber: FiberNode) => {
		if (shouldTrackEffects && fiber.alternate === null) { // TODO: 需要听一下
			fiber.flags |= Placement;
		}
		return fiber;
	};

	const reconcileSingleElement = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) => {
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	};

	const reconcileTextNode = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string
	) => {
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

		if (__DEV__) {
			console.warn('reconcileChildFibers: unhandled unit of work type', newChild);
		}
		return null;
	};
};

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
