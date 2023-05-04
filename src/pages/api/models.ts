import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAi from '@/lib/openai'

type Data = {
    models: Array<string>
}

const getModels = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
): Promise<void> => {
    const modelRes = await OpenAi.listModels()
    const models = modelRes.data.data.map((model) => model.id)
    res.status(200).json({ models })
}

export default getModels
