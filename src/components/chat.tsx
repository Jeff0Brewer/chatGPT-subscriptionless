import React, { FC, useState, useEffect } from 'react'
import type {
    ChatCompletionRequestMessage as Message,
    ChatCompletionRequestMessageRoleEnum as Role
} from 'openai'
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
    const [lastRole, setLastRole] = useState<Role | null>(null)

    useEffect(() => {
        if (!tree) { return }
        // get chat completion if user sent last message
        if (lastRole === 'user') {
            getCompletion()
        }
    }, [tree]) // tree as dependency to get completion on tree update

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
        if (!tree) { return }

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
        let content = ''
        const newMessage: Message = { role: 'assistant', content }
        const newInd = tr.addMessage(tree, inds, newMessage)
        const nodeInd = [...inds, newInd]
        setInds(nodeInd)
        setLastRole(newMessage.role)

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
                        content += token
                        tr.setContent(tree, nodeInd, content)
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
        if (!tree) {
            // create new tree if no current messages
            setTree(tr.new(message))
            setInds([])
        } else {
            // add message as child of current message
            const ind = tr.addMessage(tree, inds, message)
            setTree({ ...tree })
            // update indices with index of new message
            setInds([...inds, ind])
        }
        setLastRole(message.role)
    }

    const addVariant = (message: Message, inds: Array<number>): void => {
        if (!tree) { return }
        const ind = tr.addMessage(tree, inds, message)
        setTree({ ...tree })
        setInds([...inds, ind])
        setLastRole(message.role)
    }

    const changeVariant = (inds: Array<number>, delta: number): void => {
        if (!tree) { return }
        const newInds = tr.changeVariant(tree, inds, delta)
        const newMsg = tr.getNode(tree, inds).message
        setInds(newInds)
        setLastRole(newMsg.role)
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
