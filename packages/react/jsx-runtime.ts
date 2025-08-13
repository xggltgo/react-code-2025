export { jsx, Fragment } from './src/jsx';

// TypeScript typing for the new JSX transform in prod
// Ensures JSX expressions are typed as our internal ReactElementType
import type { ReactElementType } from 'shared/ReactTypes';

export namespace JSX {
	export type Element = ReactElementType;
	export interface IntrinsicElements {
		[key: string]: any;
	}
}
