import React, { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { FiEdit } from 'react-icons/fi'
import type { TreeNode } from '@/lib/message-tree'
import { impl as tr } from '@/lib/message-tree'
import userIcon from '@/icons/user-icon.jpg'
import gptIcon from '@/icons/gpt-icon.jpg'
import styles from '@/styles/MessageList.module.css'

type MessageListProps = {
    model: string,
    tree: TreeNode,
    inds: Array<number>
}

const MessageList: FC<MessageListProps> = props => {
    return (
        <section className={styles.list}>
            <p className={styles.modelLabel}>Model: {props.model}</p>
            <div>
                <MessageDisplay node={props.tree} inds={props.inds} />
            </div>
        </section>
    )
}

type MessageDisplayProps = {
    node: TreeNode,
    inds: Array<number>
}

const MessageDisplay: FC<MessageDisplayProps> = props => {
    return (
        <>
            <div className={styles.display} data-role={props.node.message.role}>
                <span className={styles.inner}>
                    <Image
                        className={styles.icon}
                        width={40}
                        height={40}
                        src={props.node.message.role === 'user' ? userIcon.src : gptIcon.src}
                        alt={props.node.message.role}
                    />
                    <ReactMarkdown className={styles.content}>
                        {props.node.message.content}
                    </ReactMarkdown>
                    <button className={styles.edit}><FiEdit /></button>
                </span>
            </div>
            { props.inds.length === 0
                ? <></>
                : <MessageDisplay node={props.node.nexts[props.inds[0]]} inds={props.inds.slice(1)} /> }
        </>
    )
}

export default MessageList
