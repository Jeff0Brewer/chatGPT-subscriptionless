import React, { FC, useState, useRef, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import type { TreeNode } from '@/lib/message-tree'
import { resizeToFit } from '@/lib/textarea'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'
import styles from '@/styles/MessageList.module.css'

type MessageListProps = {
    model: string,
    tree: TreeNode,
}

const MessageList: FC<MessageListProps> = props => {
    return (
        <section className={styles.list}>
            <p className={styles.modelLabel}>Model: {props.model}</p>
            <div>
                <MessageDisplay node={props.tree} currInd={0} numVariant={0} />
            </div>
        </section>
    )
}

type MessageDisplayProps = {
    node: TreeNode,
    currInd: number,
    numVariant: number,
}

const MessageDisplay: FC<MessageDisplayProps> = props => {
    const { inds, addVariant, changeVariant } = useContext(ListContext)
    if (!inds || !addVariant || !changeVariant) {
        throw new Error('ListContext uninitialized')
    }
    const message = props.node.message

    const incVariant = (): void => {
        changeVariant(inds.slice(0, props.currInd), 1)
    }

    const decVariant = (): void => {
        changeVariant(inds.slice(0, props.currInd), -1)
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
                        ? <UserMessageDisplay node={props.node} currInd={props.currInd} />
                        : <ReactMarkdown className={styles.content}>{message.content}</ReactMarkdown> }
                    { props.numVariant > 1 &&
                         <div className={styles.variantSelect}>
                             <button onClick={decVariant}><FiChevronLeft /></button>
                             <p>{`${inds[props.currInd - 1] + 1} / ${props.numVariant}`}</p>
                             <button onClick={incVariant}><FiChevronRight /></button>
                         </div> }
                </span>
            </div>
            { props.currInd < inds.length
                ? <MessageDisplay
                    node={props.node.nexts[inds[props.currInd]]}
                    currInd={props.currInd + 1}
                    numVariant={props.node.nexts.length}
                />
                : <></> }
        </>
    )
}

type UserMessageDisplayProps = {
    node: TreeNode,
    currInd: number
}

const UserMessageDisplay: FC<UserMessageDisplayProps> = props => {
    const [editing, setEditing] = useState<boolean>(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const { inds, addVariant } = useContext(ListContext)
    if (!inds || !addVariant) {
        throw new Error('ListContext uninitialized')
    }

    const resizeInput = (): void => {
        if (!inputRef.current) { return }
        resizeToFit(inputRef.current)
    }

    const startEdit = (): void => { setEditing(true) }

    const cancelEdit = (): void => { setEditing(false) }

    const saveEdit = (): void => {
        if (!inputRef.current) { return }
        const content = inputRef.current.value
        addVariant(props.node, inds.slice(0, props.currInd), { role: 'user', content })
        setEditing(false)
    }

    return (
        <>
            { editing
                ? <div className={styles.content}>
                    <textarea
                        ref={inputRef}
                        onInput={resizeInput}
                        defaultValue={props.node.message.content}
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
                : <pre className={styles.content}>{props.node.message.content}</pre> }
            <button className={styles.edit} onClick={startEdit}><FiEdit /></button>
        </>
    )
}

type ListContextValues = {
    inds: Array<number>,
    addVariant: (node: TreeNode, nodeInd: Array<number>, message: Message) => void,
    changeVariant: (nodeInd: Array<number>, delta: number) => void
}

const ListContext = createContext<Partial<ListContextValues>>({})

export default MessageList

export {
    ListContext
}
