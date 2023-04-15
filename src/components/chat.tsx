import React, { FC, useState } from 'react'
import ModelDropdown from '@/components/model-dropdown'
import { MODELS } from '@/lib/models'
import styles from '@/styles/Chat.module.css'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(MODELS[0])

    return (
        <main className={styles.chat}>
            <ModelDropdown model={model} setModel={setModel} />
        </main>
    )
}

export default Chat
