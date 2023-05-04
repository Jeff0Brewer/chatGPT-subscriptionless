import React, { FC, useState, useEffect, useRef } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import { TbSend } from 'react-icons/tb'
import ModelDropdown from '@/components/model-dropdown'
import styles from '@/styles/Chat.module.css'

const Chat: FC = () => {
    const [model, setModel] = useState<string>('gpt-3.5-turbo')
    const [messages, setMessages] = useState<Array<Message>>([])
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (messages.length && messages[messages.length - 1].role === 'user') {
            getCompletion()
        }
    }, [messages])

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
        const res = await fetch('/api/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages
            })
        })
        const { content } = await res.json()
        if (!res.ok) {
            throw new Error(`Completion error: ${content}`)
        }
        setMessages([...messages, { role: 'assistant', content }])
    }

    const onTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        // resize textarea to fit current content
        // set height to 0, overflowing into scroll height
        // then set height to scroll height
        e.target.style.height = ''
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    const sendMessage = (): void => {
        if (!inputRef.current) { return }
        const content = inputRef.current.value
        setMessages([...messages, { role: 'user', content }])
    }

    return (
        <main className={styles.chat}>
            <ModelDropdown model={model} setModel={setModel} />
            <div className={styles.bottom}>
                <div className={styles.messageInput}>
                    <textarea
                        ref={inputRef}
                        onInput={onTextAreaInput}
                        placeholder="Send a message..."
                    />
                    <button onClick={sendMessage}><TbSend /></button>
                </div>
                <p className={styles.footer}>
                    ChatGPT may produce inaccurate information about people, places, or facts.
                </p>
            </div>
        </main>
    )
}

export default Chat
