import React, { FC, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { TreeNode } from '@/lib/message-tree'
import { useListContext } from '@/lib/list-context'
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
    const { inds } = useListContext()
    return <>
        { props.node.message.role !== 'system' &&
        <div className={styles.display} data-role={props.node.message.role}>
            <span className={styles.inner}>
                <Image
                    className={styles.icon}
                    width={40}
                    height={40}
                    src={props.node.message.role === 'user' ? userIcon.src : gptIcon.src}
                    alt={props.node.message.role}
                />
                { props.node.message.role === 'user'
                    ? <UserMessageDisplay node={props.node} currInd={props.currInd} />
                    : <ReactMarkdown className={styles.gptContent}>
                        {props.node.message.content}
                    </ReactMarkdown> }
                <VariantSelector currInd={props.currInd} numVariant={props.numVariant} />
            </span>
        </div> }
        {/* append next in tree recursively to display full list */}
        { props.currInd < inds.length &&
                <MessageDisplay
                    node={props.node.nexts[inds[props.currInd]]}
                    currInd={props.currInd + 1}
                    numVariant={props.node.nexts.length}
                /> }
    </>
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

type UserMessageDisplayProps = {
    node: TreeNode,
    currInd: number
}

const UserMessageDisplay: FC<UserMessageDisplayProps> = props => {
    const [editing, setEditing] = useState<boolean>(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const { inds, addVariant } = useListContext()

    const startEdit = (): void => { setEditing(true) }

    const cancelEdit = (): void => { setEditing(false) }

    const saveEdit = (): void => {
        if (!inputRef.current) { return }
        const content = inputRef.current.value
        addVariant(props.node, inds.slice(0, props.currInd), { role: 'user', content })
        setEditing(false)
    }

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
            : <pre className={styles.userContent}>{props.node.message.content}</pre> }
        <button className={styles.edit} onClick={startEdit}><FiEdit /></button>
    </>
}

export default MessageList
