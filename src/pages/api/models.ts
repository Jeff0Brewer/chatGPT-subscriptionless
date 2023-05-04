import type { NextApiRequest, NextApiResponse } from 'next'
import type { ErrorResponse } from '@/lib/types'
import OpenAi from '@/lib/openai'

const VALID_MODELS = [
    'babbage',
    'davinci',
    'ada',
    'gpt-4',
    'gpt-3.5-turbo',
    'whisper-1',
    'curie'
]

type Data = {
    models: Array<string>
}

const getModels = async (
    req: NextApiRequest,
    res: NextApiResponse<Data | ErrorResponse>
): Promise<void> => {
    const modelRes = await OpenAi.listModels()
    const models = modelRes.data.data
        .map(model => model.id)
        .filter(id => VALID_MODELS.includes(id))
    if (models.length === 0) {
        res.status(404).json({ message: 'No valid models found' })
    }
    res.status(200).json({ models })
}

export default getModels
