export type WorkTag = typeof FunctionComponent | typeof HostRoot | typeof HostComponent | typeof HostText | typeof Fragment; // 节点类型

export const FunctionComponent = 0; // 函数组件节点
export const HostRoot = 3; // 根节点
export const HostComponent = 5; // 内置组件节点
export const HostText = 6; // 文本节点
export const Fragment = 7; 