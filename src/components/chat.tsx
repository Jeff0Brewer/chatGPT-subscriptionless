import React, { FC, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ModelDropdown from '@/components/model-dropdown'
import MessageInput from '@/components/message-input'
import MessageList from '@/components/message-list'
import type { TreeNode } from '@/lib/message-tree'
import { impl as tr } from '@/lib/message-tree'
import { jsonPostBody } from '@/lib/fetch'
import styles from '@/styles/Chat.module.css'

const DEFAULT_MODEL = 'GPT-3.5-turbo'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(DEFAULT_MODEL)
    const [tree, setTree] = useState<TreeNode | null>(null)
    const [inds, setInds] = useState<Array<number>>([])
    const [lastNode, setLastNode] = useState<TreeNode | null>(null)

    useEffect(() => {
        // get chat completion if user sent last message
        if (tree && lastNode && lastNode.message.role === 'user') {
            getCompletion()
        }
    }, [tree])

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
        if (!tree || !lastNode) { return }

        // get completion stream from endpoint using current message tree
        const messages = tr.getList(tree, inds)
        const res = await fetch('/api/complete', jsonPostBody({ model, messages }))
        if (!res.ok) {
            const { message } = await res.json()
            throw new Error(`Completion error: ${message}`)
        }
        const reader = await res.body?.getReader()
        if (!reader) {
            throw new Error('Invalid stream reader from endpoint')
        }

        // add new empty message to tree, fill in content as its streamed
        const { ind, node } = tr.addChild(lastNode, { role: 'assistant', content: '' })
        setInds([...inds, ind])
        setLastNode(node)

        // explicit any type since ReadableStreamReadResult interface is private :)
        const readStream = ({ done, value }: any): Promise<void> | void => {
            if (done) { return }
            const lines = Buffer.from(value)
                .toString()
                .split('\n')
                .filter(line => line.trim() !== '')
            for (const line of lines) {
                const response = line.replace(/^data: /, '')
                if (response === '[DONE]') {
                    return
                } else {
                    const token = JSON.parse(response)?.choices?.[0]?.delta?.content
                    if (token) {
                        node.message.content += token
                        setTree({ ...tree })
                    }
                }
            }
            return reader.read().then(readStream)
        }
        await reader.read().then(readStream)
    }

    // add message to curr list
    const addMessage = (message: Message): void => {
        if (!tree || !lastNode) {
            // create new tree if no current messages
            const node = tr.new(message, null)
            setTree(node)
            setLastNode(node)
            setInds([])
        } else {
            // add message as child of current message
            const { ind, node } = tr.addChild(lastNode, message)
            setTree({ ...tree })
            setLastNode(node)
            // update indices with index of new message
            setInds([...inds, ind])
        }
    }

    const addVariant = (node: TreeNode, nodeInd: Array<number>, message: Message): void => {
        if (!tree) { return }
        const { ind, node: variant } = tr.addSibling(node, message)
        setTree({ ...tree })
        setInds([...nodeInd.slice(0, -1), ind])
        setLastNode(variant)
    }

    const changeVariant = (nodeInd: Array<number>, delta: number): void => {
        if (!tree) { return }
        const { inds: newInds, lastNode } = tr.changeVariant(tree, nodeInd, delta)
        setInds(newInds)
        setLastNode(lastNode)
    }

    return (
        <main className={styles.chat}>
            { tree
                ? <MessageList
                    model={model}
                    tree={tree}
                    inds={inds}
                    addVariant={addVariant}
                    changeVariant={changeVariant}
                />
                : <ModelDropdown model={model} setModel={setModel} /> }
            <div className={styles.bottom}>
                <MessageInput addMessage={addMessage} />
                <p className={styles.footer}>
                    ChatGPT may produce inaccurate information about people, places, or facts.
                </p>
            </div>
        </main>
    )
}

export default Chat
