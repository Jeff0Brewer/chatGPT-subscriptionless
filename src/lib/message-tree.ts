import type { ChatCompletionRequestMessage as Message } from 'openai'

type TreeNode = {
    message: Message,
    prev: TreeNode | null,
    nexts: Array<TreeNode>
}

const newNode = (message: Message, prev: TreeNode | null): TreeNode => {
    return { message, prev, nexts: [] }
}

// traverse tree using inds to select child variants
// accumulate into list
const getList = (head: TreeNode, inds: Array<number>): Array<Message> => {
    const messages = []
    let curr = head
    // exclude empty system message
    // enabling first node variants and custom sys message
    if (curr.message.role === 'system' && curr.message.content) {
        messages.push(curr.message)
    }
    for (let i = 0; i < inds.length; i++) {
        curr = curr.nexts[inds[i]]
        if (!curr) {
            throw new Error(`Node at index ${inds.slice(0, i + 1)} does not exist`)
        }
        messages.push(curr.message)
    }
    return messages
}

// add new child node to parent node's nexts list
// return node and node's index in parent's nexts list
const addChild = (parent: TreeNode, message: Message): { ind: number, node: TreeNode } => {
    const node = newNode(message, parent)
    const ind = parent.nexts.length
    parent.nexts.push(node)
    return { ind, node }
}

// add new node as sibling in nexts list
// return node and node's index in parent's nexts list
const addSibling = (head: TreeNode, nodeInds: Array<number>, message: Message): {ind: number, node: TreeNode} => {
    let curr = head
    for (let i = 0; i < nodeInds.length; i++) {
        curr = curr.nexts[nodeInds[i]]
        if (!curr) {
            throw new Error(`Node at index ${nodeInds.slice(0, i + 1)} does not exist`)
        }
    }
    const parent = curr.prev
    if (!parent) {
        throw new Error('Cannot add sibling to node with no parent')
    }
    return addChild(parent, message)
}

// from index of node variant, get sibling variant from index delta
// return new indices from valid tree traveral and last node in sibling variant's children
const changeVariant = (head: TreeNode, nodeInd: Array<number>, delta: number):
{inds: Array<number>, lastNode: TreeNode} => {
    // traverse to node's parent
    let curr = head
    for (let i = 0; i < nodeInd.length - 1; i++) {
        curr = curr.nexts[nodeInd[i]]
        if (!curr) {
            throw new Error(`Node at index ${nodeInd.slice(0, i + 1)} does not exist`)
        }
    }
    // get index of new variant, offsetting curr variant's index by delta
    const newInd = (nodeInd[nodeInd.length - 1] + delta + curr.nexts.length) % curr.nexts.length

    // get indices from new variant's children
    const inds = [...nodeInd]
    inds[inds.length - 1] = newInd
    curr = curr.nexts[newInd]
    // always choose first variant while traversing to end of tree
    while (curr.nexts.length > 0) {
        inds.push(0)
        curr = curr.nexts[0]
    }
    return { inds, lastNode: curr }
}

export type {
    TreeNode
}

export {
    newNode,
    getList,
    addChild,
    addSibling,
    changeVariant
}
