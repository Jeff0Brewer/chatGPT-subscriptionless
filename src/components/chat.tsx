import React, { FC, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ModelDropdown from '@/components/model-dropdown'
import MessageInput from '@/components/message-input'
import { jsonPostBody } from '@/lib/fetch'
import styles from '@/styles/Chat.module.css'

import Image from 'next/image'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'

const DEFAULT_MODEL = 'GPT-3.5-turbo'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(DEFAULT_MODEL)
    const [messages, setMessages] = useState<Array<Message>>([])

    useEffect(() => {
        console.log(messages)
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

type MessageListProps = {
    model: string,
    messages: Array<Message>
}

const MessageList: FC<MessageListProps> = props => {
    return (
        <section className={styles.list}>
            <p className={styles.modelLabel}>Model: {props.model}</p>
            <div>
                { props.messages.map(({ role, content }, i) =>
                    <MessageDisplay role={role} content={content} key={i} />
                )}
            </div>
        </section>
    )
}

type MessageDisplayProps = {
    role: 'user' | 'assistant' | 'system'
    content: string
}
const MessageDisplay: FC<MessageDisplayProps> = props => {
    return (
        <div className={styles.messageDisplay} data-role={props.role}>
            <span className={styles.inner}>
                <Image
                    className={styles.icon}
                    width={40}
                    height={40}
                    src={props.role === 'user' ? userIcon.src : gptIcon.src}
                    alt={props.role}
                />
                <p className={styles.content}>{ props.content }</p>
            </span>
        </div>
    )
}

export default Chat
