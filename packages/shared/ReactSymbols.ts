const supportSymbol = typeof Symbol === 'function' && Symbol.for;

// 定义 ReactElement 的唯一标识
export const REACT_ELEMENT_TYPE = supportSymbol ? Symbol.for('react.element') : 0xeac7;

export const REACT_FRAGMENT_TYPE = supportSymbol ? Symbol.for('react.fragment') : 0xeacb;