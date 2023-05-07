import type { ChatCompletionRequestMessage as Message } from 'openai'

type TreeNode = {
    message: Message
    nexts: Array<TreeNode>
}

const treeImpl = {
    new: (message: Message): TreeNode => {
        return {
            message,
            nexts: []
        }
    },
    addMessage: (head: TreeNode, inds: Array<number>, message: Message): number => {
        let curr = head
        for (let i = 0; i < inds.length; i++) {
            curr = curr.nexts[inds[i]]
        }
        const newInd = curr.nexts.length
        curr.nexts.push(treeImpl.new(message))
        // return index of new node
        return newInd
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
    }
}

export type {
    TreeNode
}

export {
    treeImpl
}
