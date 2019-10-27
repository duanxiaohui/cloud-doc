import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import useKeyPress from '../hooks/useKeyPress'
import useIpcRenderer from '../hooks/useIpcRenderer'

const FileSearch = ({ title, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false)
    const [ value, setValue ] = useState('')
    const inputRef = useRef(null)
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const closeSearch = () => {
        setInputActive(false)
        setValue('')
        onFileSearch('')
    }
    useEffect(() => {
        if (enterPressed && inputActive) {
            onFileSearch(value)
        }
        if (escPressed && inputActive) {
            closeSearch()
        }
    })
    useEffect(() => {
        if (inputActive) {
            inputRef.current.focus()
        }
    }, [inputActive])
    useIpcRenderer({
        'search-file': () => { setInputActive(true) }
    })
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0" style={{ borderRadius: 0 }}>
            {
                !inputActive &&
                    <>
                        <span className="file-title">{title}</span>
                        <button
                            type="button"
                            className="icon-button"
                            onClick={() => { setInputActive(true) }}
                        >
                            <FontAwesomeIcon
                                size="lg"
                                icon={faSearch}
                                title="搜索"
                            />
                        </button>
                    </>
            }
            {
                inputActive &&
                <>
                    <input
                        className="form-control"
                        value={value}
                        ref={inputRef}
                        onChange={e => { setValue(e.target.value) }}
                    />
                    <button
                        type="button"
                        className="icon-button"
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
        </div>
    )
}
FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired,
}
FileSearch.defaultProps = {
    title: '我的云文档',
}
export default FileSearch