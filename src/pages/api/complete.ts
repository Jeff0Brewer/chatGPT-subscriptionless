import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionRequestMessage } from 'openai'
import type { ErrorResponse } from '@/lib/types'
import { PassThrough } from 'stream'
import OpenAi from '@/lib/openai'

type Data = {
    content: string
}

const complete = async (
    req: NextApiRequest,
    res: NextApiResponse<Data | ErrorResponse>
): Promise<void> => {
    if (typeof req.body?.model !== 'string') {
        res.status(405).json({ message: 'Invalid model id' })
        return
    }
    if (!(req.body?.messages satisfies Array<ChatCompletionRequestMessage>)) {
        res.status(405).json({ message: 'Invalid message list' })
        return
    }
    // explicit any since CreateChatCompletionResponse doesn't account for stream response
    const completion: any = await OpenAi.createChatCompletion({
        model: req.body.model.toLowerCase(),
        messages: req.body.messages,
        stream: true
    }, { responseType: 'stream' })

    const { data, headers } = completion

    // pass stream data to client
    res.setHeader('Content-Type', headers['content-type'])
    data.pipe(new PassThrough()).pipe(res)
}

export default complete
