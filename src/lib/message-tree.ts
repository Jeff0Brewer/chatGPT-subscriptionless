import type { ChatCompletionRequestMessage as Message } from 'openai'

type TreeNode = {
    message: Message,
    prev: TreeNode | null,
    nexts: Array<TreeNode>
}

const impl = {
    new: (message: Message, prev: TreeNode | null): TreeNode => {
        return {
            message,
            prev,
            nexts: []
        }
    },
    getList: (head: TreeNode, inds: Array<number>): Array<Message> => {
        const messages = []
        let curr = head
        let i = 0
        while (curr) {
            messages.push(curr.message)
            curr = curr.nexts[inds[i]]
            i++
        }
        return messages
    },
    addChild: (parent: TreeNode, message: Message): { ind: number, node: TreeNode } => {
        const ind = parent.nexts.length
        const node = impl.new(message, parent)
        parent.nexts.push(node)
        return { ind, node }
    },
    addSibling: (node: TreeNode, message: Message): {ind: number, node: TreeNode} => {
        const parent = node.prev
        if (!parent) {
            throw new Error('Cannot add sibling to node with no parent')
        }
        return impl.addChild(parent, message)
    },
    changeVariant: (head: TreeNode, nodeInd: Array<number>, delta: number): {inds: Array<number>, lastNode: TreeNode} => {
        let curr = head
        // traverse to node's parent
        for (let i = 0; i < nodeInd.length - 1; i++) {
            curr = curr.nexts[nodeInd[i]]
        }
        // get index of new variant
        const newInd = (nodeInd[nodeInd.length - 1] + delta + curr.nexts.length) % curr.nexts.length
        const inds = [...nodeInd]
        inds[inds.length - 1] = newInd
        // traverse to end of tree always choosing first variant
        curr = curr.nexts[newInd]
        while (curr.nexts.length > 0) {
            inds.push(0)
            curr = curr.nexts[0]
        }
        return { inds, lastNode: curr }
    }
}

export type {
    TreeNode
}

export {
    impl
}
