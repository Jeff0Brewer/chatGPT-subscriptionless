import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionRequestMessage } from 'openai'
import OpenAi from '@/lib/openai'
import { MODELS } from '@/lib/models'

type Data = {
    content: string
}

const complete = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
): Promise<void> => {
    if (!MODELS.includes(req.body?.model)) {
        res.status(405).json({ content: 'Invalid model id' })
        return
    }
    if (!(req.body?.messages satisfies Array<ChatCompletionRequestMessage>)) {
        res.status(405).json({ content: 'Invalid message list' })
        return
    }
    const completion = await OpenAi.createChatCompletion({
        model: req.body.model,
        messages: req.body.messages
    })
    const { choices } = completion.data
    if (
        choices.length > 0 &&
        choices[0]?.message &&
        choices[0]?.finish_reason === 'stop'
    ) {
        res.status(200).json({ content: choices[0].message.content })
        return
    }
    res.status(500).json({ content: 'Completion failed' })
}

export default complete
