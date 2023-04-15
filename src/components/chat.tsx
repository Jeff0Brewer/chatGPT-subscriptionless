import React, { FC, useState } from 'react'
import { TbSend } from 'react-icons/tb'
import ModelDropdown from '@/components/model-dropdown'
import { MODELS } from '@/lib/models'
import styles from '@/styles/Chat.module.css'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(MODELS[0])

    const onTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        // resize textarea to fit current content
        // set height to 0, overflowing into scroll height
        // then set height to scroll height
        e.target.style.height = ''
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    return (
        <main className={styles.chat}>
            <ModelDropdown model={model} setModel={setModel} />
            <div className={styles.bottom}>
                <div className={styles.messageInput}>
                    <textarea onInput={onTextAreaInput} placeholder="Send a message..." />
                    <button><TbSend /></button>
                </div>
                <p className={styles.footer}>
                    ChatGPT may produce inaccurate information about people, places, or facts.
                </p>
            </div>
        </main>
    )
}

export default Chat
