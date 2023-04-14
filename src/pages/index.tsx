import React, { FC } from 'react'
import Head from 'next/head'
import Chat from '@/components/chat'

const Home: FC = () => {
    return (
        <>
            <Head>
                <title>gpt nosub</title>
                <meta name="description" content="chat gpt client for use with user api key" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Chat />
        </>
    )
}

export default Home
