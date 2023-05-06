import React, { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'
import styles from '@/styles/MessageList.module.css'

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
                <ReactMarkdown className={styles.content}>
                    {props.content}
                </ReactMarkdown>
            </span>
        </div>
    )
}

export default MessageList
