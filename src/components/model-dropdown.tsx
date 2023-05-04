import React, { FC, useState, useEffect } from 'react'
import { RxCaretDown } from 'react-icons/rx'
import { MdCheck } from 'react-icons/md'
import styles from '@/styles/ModelDropdown.module.css'

type ModelDropdownProps = {
    model: string,
    setModel: (model: string) => void
}

const ModelDropdown: FC<ModelDropdownProps> = props => {
    const [open, setOpen] = useState<boolean>(false)
    const [models, setModels] = useState<Array<string>>([])

    useEffect(() => {
        getModels()
    }, [])

    const getModels = async (): Promise<void> => {
        const res = await fetch('/api/models')
        if (!res.ok) {
            const { message } = await res.json()
            throw new Error(`Model list could not be retrieved: ${message}`)
        }
        const { models } = await res.json()
        setModels(models)
    }

    const closeOnBlur = (e: React.FocusEvent<HTMLDivElement>): void => {
        // check if child element has focus
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setOpen(false)
        }
    }

    // get handler to set model then close list
    const getModelSetter = (model: string): (() => void) => {
        return () => {
            props.setModel(model)
            setOpen(false)
        }
    }

    const toggleOpen = (): void => {
        setOpen(!open)
    }

    return (
        <div
            className={styles.dropdown}
            tabIndex={-1 /* negative index for blur events but no tabbing */}
            onBlur={closeOnBlur}
        >
            <button className={styles.toggle} onClick={toggleOpen}>
                <div>
                    <p className={styles.label}>Model</p>
                    <p className={styles.curr}>{props.model}</p>
                </div>
                <div className={styles.arrow}><RxCaretDown /></div>
            </button>
            <div className={`${styles.list} ${open ? styles.visible : styles.hidden}`}>{
                models.map((model: string, i: number) => (
                    <a
                        onClick={getModelSetter(model)}
                        data-selected={model === props.model}
                        key={i}
                    >
                        {model}
                        <div className={styles.check}><MdCheck /></div>
                    </a>
                ))
            }</div>
        </div>
    )
}

export default ModelDropdown
