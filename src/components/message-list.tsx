import React, { FC, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { FiEdit, FiRefreshCcw, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import type { TreeNode } from '@/lib/message-tree'
import { impl as tr } from '@/lib/message-tree'
import { resizeToFit } from '@/lib/textarea'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'
import styles from '@/styles/MessageList.module.css'

type MessageListProps = {
    model: string,
    tree: TreeNode,
    inds: Array<number>,
    addVariant: (message: Message, inds: Array<number>) => void
}

const MessageList: FC<MessageListProps> = props => {
    return (
        <section className={styles.list}>
            <p className={styles.modelLabel}>Model: {props.model}</p>
            <div>
                <MessageDisplay
                    node={props.tree}
                    inds={props.inds}
                    currInd={0}
                    numVariant={0}
                    addVariant={props.addVariant}
                />
            </div>
        </section>
    )
}

type MessageDisplayProps = {
    node: TreeNode,
    inds: Array<number>,
    currInd: number,
    numVariant: number,
    addVariant: (message: Message, inds: Array<number>) => void
}

const MessageDisplay: FC<MessageDisplayProps> = props => {
    const [editing, setEditing] = useState<boolean>(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const message = props.node.message

    const startEdit = (): void => {
        setEditing(true)
    }

    const regenResponse = (): void => {
        // placeholder
    }

    const resizeInput = (): void => {
        if (!inputRef.current) { return }
        resizeToFit(inputRef.current)
    }

    const saveEdit = (): void => {
        if (!inputRef.current) { return }
        const content = inputRef.current.value
        props.addVariant({ role: 'user', content }, props.inds.slice(0, props.currInd - 1))
        setEditing(false)
    }

    const cancelEdit = (): void => {
        setEditing(false)
    }

    return (
        <>
            <div className={styles.display} data-role={message.role}>
                <span className={styles.inner}>
                    <Image
                        className={styles.icon}
                        width={40}
                        height={40}
                        src={message.role === 'user' ? userIcon.src : gptIcon.src}
                        alt={message.role}
                    />
                    { message.role === 'user'
                        ? editing
                            ? <div className={styles.content}>
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
                            : <pre className={styles.content}>{message.content}</pre>
                        : <ReactMarkdown className={styles.content}>{message.content}</ReactMarkdown> }
                    <button
                        className={styles.edit}
                        onClick={message.role === 'user' ? startEdit : regenResponse}
                    >
                        { message.role === 'user'
                            ? <FiEdit />
                            : <FiRefreshCcw /> }
                    </button>
                    { props.numVariant > 1
                        ? <div className={styles.variantSelect}>
                            <button><FiChevronLeft /></button>
                            <p>{`${props.inds[props.currInd - 1] + 1} / ${props.numVariant}`}</p>
                            <button><FiChevronRight /></button>
                        </div>
                        : <></>}
                </span>
            </div>
            { props.currInd < props.inds.length
                ? <MessageDisplay
                    node={props.node.nexts[props.inds[props.currInd]]}
                    inds={props.inds}
                    currInd={props.currInd + 1}
                    numVariant={props.node.nexts.length}
                    addVariant={props.addVariant} />
                : <></> }
        </>
    )
}

export default MessageList
