type ModelInfo = {
    name: string,
    description: string,
    reasoning: number,
    speed: number,
    conciseness: number
}

type ModelInfoMap = {
    [id: string]: ModelInfo
}

const MODELS: Array<string> = [
    'gpt-4',
    'text-davinci-002-render-sha',
    'text-davinci-002-render-paid'
]

const MODEL_INFO: ModelInfoMap = {
    'gpt-4': {
        name: 'GPT-4',
        description: 'GPT-4 excels at tasks that require advanced reasoning, complex instruction understanding, and more creativity',
        reasoning: 5,
        speed: 2,
        conciseness: 4
    },
    'text-davinci-002-render-sha': {
        name: 'Default (GPT-3.5)',
        description: 'Optimized for speed',
        reasoning: 3,
        speed: 5,
        conciseness: 2
    },
    'text-davinci-002-render-paid': {
        name: 'Legacy (GPT-3.5)',
        description: 'The previous ChatGPT Plus model',
        reasoning: 3,
        speed: 2,
        conciseness: 1
    }
}

export {
    MODELS,
    MODEL_INFO
}

export type {
    ModelInfo,
    ModelInfoMap
}
