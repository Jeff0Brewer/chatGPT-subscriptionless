import React, { FC, useRef } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import { TbSend } from 'react-icons/tb'
import styles from '@/styles/MessageInput.module.css'

type MessageInputProps = {
    addMessage: (msg: Message) => void
}

const MessageInput: FC<MessageInputProps> = props => {
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = (): void => {
        if (!inputRef.current) { return }
        // send user message
        const content = inputRef.current.value
        props.addMessage({ role: 'user', content })
        // clear and resize input
        inputRef.current.value = ''
        resizeInput()
    }

    const resizeInput = (): void => {
        if (!inputRef.current) { return }
        // set height to 0, overflowing into scroll height
        inputRef.current.style.height = ''
        // then set height to scroll height
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }

    const sendOnCtrlEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (!inputRef.current) { return }
        if (e.key === 'Enter' && e.getModifierState('Control')) {
            sendMessage()
        }
    }

    return (
        <div className={styles.wrap}>
            <textarea
                ref={inputRef}
                onInput={resizeInput}
                onKeyDown={sendOnCtrlEnter}
                placeholder="Send a message..."
            />
            <button onClick={sendMessage}><TbSend /></button>
        </div>
    )
}

export default MessageInput
