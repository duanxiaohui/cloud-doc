import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
    const [ editStatus, setEditStatus ] = useState(false)
    const [ value, setValue ] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const inputRef = useRef(null)
    const closeSearch = () => {
        setEditStatus(false)
        setValue('')
        const editFile = files.find(file => file.id === editStatus)
        if (editFile && editFile.isNew) {
            onFileDelete(editFile.id)
        }
    }
    const clickElement = useContextMenu([
        {
            label: '打开',
            click: () => {
                const parentElement = getParentNode(clickElement.current, 'file-item')
                if (parentElement) {
                    onFileClick(parentElement.dataset.id)
                }
            },
        },
        {
            label: '重命名',
            click: () => {
                const parentElement = getParentNode(clickElement.current, 'file-item')
                if (parentElement) {
                    const { id, title } = parentElement.dataset
                    setEditStatus(id)
                    setValue(title)
                }
            },
        },
        {
            label: '删除',
            click: () => {
                const parentElement = getParentNode(clickElement.current, 'file-item')
                if (parentElement) {
                    onFileDelete(parentElement.dataset.id)
                }
            },
        },
    ], '.file-list', files)

    useEffect(() => {
        const editFile = files.find(file => file.id === editStatus)
        if (enterPressed && editStatus && value.trim() !== '') {
            onSaveEdit(editStatus, value, editFile.isNew)
            setEditStatus(false)
            setValue('')
        }
        if (escPressed && editStatus) {
            closeSearch()
        }
    })
    useEffect(() => {
        const newFile = files.find(file => file.isNew)
        if (newFile) {
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    }, [files])
    useEffect(() => {
        if (editStatus) {
            inputRef.current.focus()
        }
    }, [editStatus])
    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li
                        data-id={file.id}
                        data-title={file.title}
                        className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
                        key={file.id}
                    >
                        {
                            ((editStatus !== file.id) && !file.isNew) &&
                                <>
                                    <span className="col-2">
                                         <FontAwesomeIcon
                                             icon={faMarkdown}
                                             size="lg"
                                         />
                                    </span>
                                    <span
                                        className="col-10 c-click"
                                        onClick={() => {onFileClick(file.id)}}
                                    >
                                        {file.title}
                                    </span>
                                </>
                        }
                        {
                            ((editStatus === file.id) || file.isNew) &&
                            <>
                                <input
                                    placeholder="请输入文件名称"
                                    className="form-control col-10"
                                    value={value}
                                    ref={inputRef}
                                    onChange={e => { setValue(e.target.value) }}
                                />
                                <button
                                    type="button"
                                    className="icon-button col-2"
                                    onClick={closeSearch}
                                >
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        size="lg"
                                        title="关闭"
                                    />
                                </button>
                            </>
                        }
                    </li>
                ))
            }
        </ul>
    )
}

FileList.propTypes = {
    files: PropTypes.array.isRequired,
    onFileClick: PropTypes.func,
    onSaveEdit: PropTypes.func,
    onFileDelete: PropTypes.func,
}

export default FileList