import type { ChatCompletionRequestMessage as Message } from 'openai'

type TreeNode = {
    message: Message
    nexts: Array<TreeNode>
}

const impl = {
    new: (message: Message): TreeNode => {
        return {
            message,
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
    getNode: (head: TreeNode, inds: Array<number>): TreeNode => {
        let curr = head
        for (let i = 0; i < inds.length; i++) {
            curr = curr.nexts[inds[i]]
        }
        return curr
    },
    addMessage: (head: TreeNode, inds: Array<number>, message: Message): number => {
        const node = impl.getNode(head, inds)
        const newInd = node.nexts.length
        node.nexts.push(impl.new(message))
        return newInd
    },
    setContent: (head: TreeNode, inds: Array<number>, content: string): void => {
        const node = impl.getNode(head, inds)
        node.message.content = content
    },
    changeVariant: (head: TreeNode, inds: Array<number>, delta: number): Array<number> => {
        const newInds = inds.slice(0, -1)
        const parent = impl.getNode(head, newInds)
        const newInd = (inds[inds.length - 1] + delta) % parent.nexts.length
        newInds.push(newInd)
        let curr = parent.nexts[newInd]
        while (curr.nexts.length > 0) {
            newInds.push(0)
            curr = curr.nexts[0]
        }
        return newInds
    }
}

export type {
    TreeNode
}

export {
    impl
}
