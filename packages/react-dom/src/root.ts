import { createContainer, updateContainer } from 'react-reconciler/src/fiberReconciler';
import { Container } from './hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { initEvent } from './SyntheticEvent';

export function createRoot(container: Container) {
	const fiberRootNode = createContainer(container);
	return {
		render(element: ReactElementType) {
			initEvent(container, 'click');
			updateContainer(element, fiberRootNode);
		}
	};
}
