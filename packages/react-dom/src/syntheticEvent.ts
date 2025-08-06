import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

export const REACT_ELEMENT_PROPS = '__reactElementProps';
const validEventTypeList = ['click'];

type EventCallback = (e: Event) => void;

interface CollectEventMap {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

export interface DOMElement extends Element {
	[REACT_ELEMENT_PROPS]: Props;
}

export const updateFiberProps = (node: DOMElement, props: Props): void => {
	node[REACT_ELEMENT_PROPS] = props;
};

const getSyntheticEventNameList = (eventType: string): string[] | undefined => {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
};

const collectEvent = (targetElement: DOMElement, container: Container, eventType: string) => {
	const collectEventMap: CollectEventMap = {
		capture: [],
		bubble: []
	};
	while (targetElement && targetElement !== container) {
		const reactElementProps = targetElement[REACT_ELEMENT_PROPS];
		if (reactElementProps) {
			const syntheticEventNameList = getSyntheticEventNameList(eventType);
			if (syntheticEventNameList) {
				syntheticEventNameList.forEach((syntheticEventName, index) => {
					const eventCallback = reactElementProps[syntheticEventName];
					if (eventCallback) {
						if (index === 0) {
							collectEventMap.capture.unshift(eventCallback);
						} else {
							collectEventMap.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}
	return collectEventMap;
};

const createSyntheticEvent = (e: Event): Event => {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
};

const triggerEvent = (eventList: EventCallback[], se: SyntheticEvent): void => {
	for (let i = 0; i < eventList.length; i++) {
		const eventCallback = eventList[i];
		eventCallback.call(null, se);
		if (se.__stopPropagation) {
			break;
		}
	}
};

const dispatchEvent = (container: Container, eventType: string, e: Event): void => {
	const targetElement = e.target as DOMElement;
	if (targetElement === null) {
		console.warn('事件目标为空', e);
		return;
	}
	// 1. 事件收集
	const { capture, bubble } = collectEvent(targetElement, container, eventType);
	// 2. 创建合成事件
	const syntheticEvent = createSyntheticEvent(e);
	// 3. 事件触发
	triggerEvent(capture, syntheticEvent);
    if(!syntheticEvent.__stopPropagation) {
        triggerEvent(bubble, syntheticEvent);
    }
};

export const initEvent = (container: Container, eventType: string): void => {
	if (!validEventTypeList.includes(eventType)) {
		console.warn(`不支持的事件类型${eventType}`);
	}
	if (__DEV__) {
		console.log(`初始化${eventType}事件`);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
};
