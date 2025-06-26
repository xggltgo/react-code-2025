import currentDispatcher, { Dispatcher, resloveDispatcher } from './src/currentDispatcher';
import { jsx } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resloveDispatcher();
	return dispatcher.useState(initialState);
};

// 内部数据共享层，充当React和Reconclier之间的桥梁
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export default {
	version: '0.0.0',
	createElement: jsx
};
