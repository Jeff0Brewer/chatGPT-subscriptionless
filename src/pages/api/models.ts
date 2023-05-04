import type { NextApiRequest, NextApiResponse } from 'next'
import type { ErrorResponse } from '@/lib/types'
import OpenAi from '@/lib/openai'

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
        .filter(id => id.includes('gpt'))
        .map(id => id.replace('gpt', 'GPT'))
    if (models.length === 0) {
        res.status(404).json({ message: 'No valid models found' })
    }
    res.status(200).json({ models })
}

export default getModels
