import React, { FC, useState, useEffect, useRef } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ModelDropdown from '@/components/model-dropdown'
import MessageInput from '@/components/message-input'
import ChatHistory from '@/components/message-list'
import ListContext from '@/lib/list-context'
import type { TreeNode } from '@/lib/message-tree'
import * as tr from '@/lib/message-tree'
import { jsonPostBody } from '@/lib/fetch'
import styles from '@/styles/Chat.module.css'

const DEFAULT_MODEL = 'GPT-3.5-turbo'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(DEFAULT_MODEL)
    const [tree, setTree] = useState<TreeNode>(tr.newNode({ role: 'system', content: '' }, null))
    const [inds, setInds] = useState<Array<number>>([])
    const [lastNode, setLastNode] = useState<TreeNode>(tree)
    const [streaming, setStreaming] = useState<boolean>(false)
    const streamContent = useRef<string>('')

    useEffect(() => {
        // get chat completion if user sent last message
        // prevent new completions while already streaming
        if (!streaming && lastNode.message.role === 'user') {
            getCompletion()
        }
    }, [tree])

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
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
        setStreaming(true)
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
                    try {
                        const token = JSON.parse(response)?.choices?.[0]?.delta?.content
                        if (token) { streamContent.current += token }
                    } catch {
                        console.log(`JSON parse error for: ${response}`)
                    }
                }
            }
            return reader.read().then(readStream)
        }
        await reader.read().then(readStream)

        addMessage({ role: 'assistant', content: streamContent.current })
        streamContent.current = ''
        setStreaming(false)
    }

    // add message to curr list
    const addMessage = (message: Message): void => {
        // add message as child of current message
        const { ind, node } = tr.addChild(lastNode, message)
        setTree({ ...tree })
        setLastNode(node)
        // update indices with index of new message
        setInds([...inds, ind])
    }

    const addVariant = (nodeInd: Array<number>, message: Message): void => {
        const { ind, node } = tr.addSibling(tree, nodeInd, message)
        setTree({ ...tree })
        setInds([...nodeInd.slice(0, -1), ind])
        setLastNode(node)
    }

    const changeVariant = (nodeInd: Array<number>, delta: number): void => {
        const { inds, lastNode } = tr.changeVariant(tree, nodeInd, delta)
        setInds(inds)
        setLastNode(lastNode)
    }

    return (
        <main className={styles.chat}>
            { lastNode.message.role !== 'system'
                ? <ListContext.Provider value={{ inds, addVariant, changeVariant }}>
                    <ChatHistory
                        model={model}
                        tree={tree}
                        streaming={streaming}
                        streamContent={streamContent}
                    />
                </ListContext.Provider>
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
