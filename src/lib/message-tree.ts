import type { ChatCompletionRequestMessage as Message } from 'openai'

type MessageNode = {
    message: Message,
    prev: MessageNode | null,
    next: MessageVariants | null
}

const newMessageNode = (message: Message): MessageNode => {
    return {
        message,
        prev: null,
        next: null
    }
}

type MessageVariants = {
    variants: Array<MessageNode>,
    current: number,
    count: number
}

const newMessageVariants = (): MessageVariants => {
    return {
        variants: [],
        current: 0,
        count: 0
    }
}

const currVariant = (self: MessageVariants | null): MessageNode | null => {
    if (!self || self.count === 0) {
        return null
    }
    return self.variants[self.current]
}

const addVariant = (self: MessageVariants, message: Message): void => {
    const sibling = newMessageNode(message)
    const curr = currVariant(self)
    if (curr) {
        sibling.prev = curr.prev
    }
    self.variants.push(sibling)
    self.current = self.variants.length - 1
    self.count += 1
}

type MessageTree = {
    head: MessageVariants,
    tail: MessageVariants
}

const newMessageTree = (): MessageTree => {
    const variants = newMessageVariants()
    return {
        head: variants,
        tail: variants
    }
}

const getCurrList = (self: MessageTree): Array<Message> => {
    const list = []
    let curr = currVariant(self.head)
    while (curr) {
        const message = curr.message
        list.push(message)
        curr = currVariant(curr.next)
    }
    return list
}

const addMessage = (self: MessageTree, message: Message) => {
    const last = currVariant(self.tail)
    if (last) {
        const newVariants = newMessageVariants()
        addVariant(newVariants, message)
        last.next = newVariants
        self.tail = newVariants
    } else {
        addVariant(self.tail, message)
    }
}

export type {
    MessageTree
}

export {
    newMessageTree,
    getCurrList,
    addMessage
}
