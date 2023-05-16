import React, { FC, useState, useRef, RefObject, useEffect, ReactElement } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import hljs from 'highlight.js'
import 'highlight.js/styles/a11y-dark.css'
import { FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { TreeNode } from '@/lib/message-tree'
import { useListContext } from '@/lib/list-context'
import { resizeToFit } from '@/lib/textarea'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'
import styles from '@/styles/MessageList.module.css'

type ChatHistoryProps = {
    model: string,
    tree: TreeNode,
    streaming: boolean,
    displayStreamed: boolean,
    streamContent: RefObject<string>
}

const ChatHistory: FC<ChatHistoryProps> = ({ model, tree, streaming, displayStreamed, streamContent }) => {
    return (
        <section className={styles.list}>
            <p className={styles.modelLabel}>Model: {model}</p>
            <MessageList node={tree} currInd={0} numVariant={0} />
            { streaming && displayStreamed &&
            <StreamDisplay streamContent={streamContent} /> }
        </section>
    )
}

type MessageListProps = {
    node: TreeNode,
    currInd: number,
    numVariant: number
}

const MessageList: FC<MessageListProps> = ({ node, currInd, numVariant }) => {
    const { inds } = useListContext()
    return <>
        <MessageDisplay message={node.message} currInd={currInd} numVariant={numVariant} />
        {/* recursively display next message until at end of tree */}
        { currInd < inds.length &&
            <MessageList
                node={node.nexts[inds[currInd]]}
                currInd={currInd + 1}
                numVariant={node.nexts.length}
            />
        }
    </>
}

type MessageDisplayProps = {
    message: Message,
    currInd: number,
    numVariant: number,
    streamNode?: boolean
}

const MessageDisplay: FC<MessageDisplayProps> = ({ message, currInd, numVariant, streamNode }) => {
    // don't display system messages
    if (message.role === 'system') { return <></> }

    return (
        <div className={message.role === 'user' ? styles.userDisplay : styles.gptDisplay}>
            <span className={styles.inner}>
                <Image
                    className={styles.icon}
                    width={40}
                    height={40}
                    src={message.role === 'user' ? userIcon.src : gptIcon.src}
                    alt={message.role}
                />
                <VariantSelector currInd={currInd} numVariant={numVariant} />
                { message.role === 'user'
                    ? <UserContent message={message} currInd={currInd} />
                    : <GptContent message={message} streamNode={streamNode} /> }
            </span>
        </div>
    )
}

type UserContentProps = {
    message: Message,
    currInd: number
}

const UserContent: FC<UserContentProps> = ({ message, currInd }) => {
    const [editing, setEditing] = useState<boolean>(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const { inds, addVariant } = useListContext()

    const saveEdit = (): void => {
        if (!inputRef.current) { return }
        const content = inputRef.current.value
        addVariant(inds.slice(0, currInd), { role: 'user', content })
        setEditing(false)
    }

    const startEdit = (): void => { setEditing(true) }
    const cancelEdit = (): void => { setEditing(false) }

    const resizeInput = (): void => {
        if (!inputRef.current) { return }
        resizeToFit(inputRef.current)
    }

    return <>
        { editing
            ? <div className={styles.userContent}>
                <textarea
                    ref={inputRef}
                    onInput={resizeInput}
                    defaultValue={message.content}
                />
                <div className={styles.editButtons}>
                    <button className={styles.saveEdit} onClick={saveEdit}>
                            Save & Submit
                    </button>
                    <button className={styles.cancelEdit} onClick={cancelEdit}>
                            Cancel
                    </button>
                </div>
            </div>
            : <>
                <pre className={styles.userContent}>{message.content}</pre>
                <button className={styles.edit} onClick={startEdit}><FiEdit /></button>
            </> }
    </>
}

type GptContentProps = {
    message: Message
    streamNode?: boolean
}

const GptContent: FC<GptContentProps> = ({ message, streamNode }) => {
    return (
        <ReactMarkdown
            className={styles.gptContent}
            components={{
                code ({ inline, className, children }): ReactElement {
                    if (inline || streamNode) {
                        return (
                            <code className={className}>
                                {children}
                            </code>
                        )
                    }
                    return (
                        <CodeBlock content={children.toString()} />
                    )
                }
            }}
        >
            {message.content}
        </ReactMarkdown>
    )
}

type CodeBlockProps = {
    content: string
}

const CodeBlock: FC<CodeBlockProps> = ({ content }) => {
    const element = useRef<HTMLElement>(null)

    useEffect(() => {
        if (element.current) {
            hljs.highlightElement(element.current)
        }
    }, [])

    return (
        <code ref={element}>
            {content}
        </code>
    )
}

type StreamDisplayProps = {
    streamContent: RefObject<string>,
}

const StreamDisplay: FC<StreamDisplayProps> = ({ streamContent }) => {
    const [message, setMessage] = useState<Message>({ role: 'assistant', content: '' })
    const intervalId = useRef<number>(-1)

    useEffect(() => {
        intervalId.current = window.setInterval(() => {
            if (streamContent.current) {
                message.content = streamContent.current
                setMessage({ ...message })
            }
        }, 100)
        return () => {
            window.clearInterval(intervalId.current)
        }
    }, [])

    return (
        <MessageDisplay message={message} currInd={0} numVariant={0} streamNode={true} />
    )
}

type VariantSelectorProps = {
    currInd: number,
    numVariant: number
}

const VariantSelector: FC<VariantSelectorProps> = props => {
    const { inds, changeVariant } = useListContext()

    const incVariant = (): void => {
        changeVariant(inds.slice(0, props.currInd), 1)
    }

    const decVariant = (): void => {
        changeVariant(inds.slice(0, props.currInd), -1)
    }

    return <>
        { props.numVariant > 1 &&
            <div className={styles.variantSelect}>
                <button onClick={decVariant}><FiChevronLeft /></button>
                <p>{`${inds[props.currInd - 1] + 1} / ${props.numVariant}`}</p>
                <button onClick={incVariant}><FiChevronRight /></button>
            </div> }
    </>
}

export default ChatHistory
