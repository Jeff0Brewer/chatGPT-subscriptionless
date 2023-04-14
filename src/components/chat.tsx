import React, { FC, useState } from 'react'
import { MODELS, MODEL_INFO } from '@/lib/models'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(MODELS[0])

    return (
        <main>
            <ModelDropdown model={model} setModel={setModel} />
        </main>
    )
}

type ModelDropdownProps = {
    model: string,
    setModel: (model: string) => void
}

const ModelDropdown: FC<ModelDropdownProps> = props => {
    return (
        <div>
            <button>{props.model}</button>
            <div>{
                MODELS.map((model: string) => (
                    <a key={model}>
                        {MODEL_INFO[model].name}
                    </a>
                ))
            }</div>
        </div>
    )
}

export default Chat
