import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionRequestMessage } from 'openai'
import type { ErrorResponse } from '@/lib/types'
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
    const completion = await OpenAi.createChatCompletion({
        model: req.body.model.toLowerCase(),
        messages: req.body.messages,
        stream: true
    }, { responseType: 'stream' })

    const stream = new Promise(resolve => {
        let result = ''
        completion.data.on('data', (data: Buffer) => {
            const lines = data
                .toString()
                .split('\n')
                .map(line => line.trim())
                .filter(line => line !== '')
            for (const line of lines) {
                const response = line.replace(/^data: /, '')
                if (response === '[DONE]') {
                    resolve(result)
                } else {
                    const token = JSON.parse(response)?.choices?.[0]?.delta?.content
                    if (token) {
                        result += token
                    }
                }
            }
        })
    })

    res.status(200).json({ content: 'none' })

    // res.status(500).json({ message: 'Completion failed' })
}

export default complete
