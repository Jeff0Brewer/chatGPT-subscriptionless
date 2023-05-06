import React, { FC, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ModelDropdown from '@/components/model-dropdown'
import MessageInput from '@/components/message-input'
import MessageList from '@/components/message-list'
import { jsonPostBody } from '@/lib/fetch'
import styles from '@/styles/Chat.module.css'

const DEFAULT_MODEL = 'GPT-3.5-turbo'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(DEFAULT_MODEL)
    const [messages, setMessages] = useState<Array<Message>>([])

    useEffect(() => {
        if (messages.length && messages[messages.length - 1].role === 'user') {
            getCompletion()
        }
    }, [messages])

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
        const res = await fetch('/api/complete', jsonPostBody({ model, messages }))
        if (!res.ok) {
            const { message } = await res.json()
            throw new Error(`Completion error: ${message}`)
        }
        const { content } = await res.json()
        setMessages([...messages, { role: 'assistant', content }])
    }

    // add message to curr list
    const addMessage = (msg: Message): void => {
        setMessages([...messages, msg])
    }

    return (
        <main className={styles.chat}>
            { messages.length === 0
                ? <ModelDropdown model={model} setModel={setModel} />
                : <MessageList model={model} messages={messages} /> }
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
