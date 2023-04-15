import React, { FC, useState } from 'react'
import { TbSend } from 'react-icons/tb'
import ModelDropdown from '@/components/model-dropdown'
import { MODELS } from '@/lib/models'
import styles from '@/styles/Chat.module.css'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(MODELS[0])

    return (
        <main className={styles.chat}>
            <ModelDropdown model={model} setModel={setModel} />
            <div className={styles.bottom}>
                <div className={styles.messageInput}>
                    <input
                        type="text"
                        placeholder="Send a message..."
                    />
                    <button>
                        <TbSend />
                    </button>
                </div>
                <p className={styles.footer}>
                    ChatGPT may produce inaccurate information about people, places, or facts.
                </p>
            </div>
        </main>
    )
}

export default Chat
