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
        // return index of new node
        return newInd
    },
    setContent: (head: TreeNode, inds: Array<number>, content: string): void => {
        const node = impl.getNode(head, inds)
        node.message.content = content
    }
}

export type {
    TreeNode
}

export {
    impl
}
