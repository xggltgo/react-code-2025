import { Key, Props, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
	// 实例变量
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;
	// 节点关系
	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number;
    // 工作单元
    pendingProps: Props;
	memoizedProps: Props | null;
    alternate: FiberNode | null;
    flags: Flags;

    constructor(tag: WorkTag, pendingProps: Props, key: Key) {
        this.tag = tag;
        this.key = key;
        this.stateNode = null;
        this.type = null;
        this.ref = null;

        this.return = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;

        this.pendingProps = pendingProps;
        this.memoizedProps = null;
        this.alternate = null;
        this.flags = NoFlags;
    }
}
