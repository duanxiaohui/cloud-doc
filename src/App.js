import React, { useState, useEffect } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import SimpleMDEEditor from 'react-simplemde-editor'
import uuidv4 from 'uuid/v4'
import { normalize, denormalize, schema } from 'normalizr'
import 'easymde/dist/easymde.min.css'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import defaultFiles from './utils/DefaultFiles'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'

const fs = window.require('fs')
const { join, basename, extname, dirname } = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')

const fileSchema = [new schema.Entity('files')]
const normalizedData = normalize(defaultFiles, fileSchema)

const fileStore = new Store({ 'name': 'File Data' })
const settingsStore = new Store({ name: 'Settings' })

const saveFilesToStore = files => {
    const fileStoreObj = Object.keys(files).reduce((result, fileId) => {
        const {id, path, title, createAt} = files[fileId]
        result[id] = {
            id,
            path,
            title,
            createAt,
        }
        return result
    }, {})
    fileStore.set('files', fileStoreObj)
}
function App() {
    const [ files, setFiles ] = useState(fileStore.get('files') || {})
    const [ searchedFiles, setSearchedFiles ] = useState([])
    const [ activeFileId, setActiveFileId ] = useState('')
    const [ openedFileIds, setOpenedFileIds ] = useState([])
    const [ unsavedFileIds, setUnsavedFileIds ] = useState([])

    const filesArr = denormalize(Object.keys(files), fileSchema, { files })
    const openedFiles = openedFileIds.map(openId => files[openId])
    const activeFile = files[activeFileId]
    const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr
    const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents')

    const fileClick = fileId => {
        setActiveFileId(fileId)
        const currentFile = files[fileId]
        if (!currentFile.isLoaded) {
            fileHelper.readFile(currentFile.path).then(data => {
                const newFile = {...currentFile, body: data, isLoaded: true }
                setFiles({ ...files, [fileId]: newFile })
            })
        }
        if (!openedFileIds.includes(fileId)) {
            setOpenedFileIds([...openedFileIds, fileId])
        }
    }
    const tabClick = fileId => {
        setActiveFileId(fileId)
    }
    const tabClose = fileId => {
        const tabWithout = openedFileIds.filter(id => id !== fileId)
        setOpenedFileIds(tabWithout)
        if (tabWithout && tabWithout.length > 0) {
            setActiveFileId(tabWithout[0])
        } else {
            setActiveFileId('')
        }
    }
    const fileChange = (id, value) => {
        if (value !== files[id].body) {
            const newFile = { ...files[id], body: value }
            setFiles({ ...files, [id]: newFile })
            if (!unsavedFileIds.includes(id)) {
                setUnsavedFileIds([...unsavedFileIds, id])
            }
        }
    }
    const deleteFile = id => {
        if (files[id].isNew) {
            delete files[id]
            const { [id]: value, ...afterFiles } = files
            setFiles(afterFiles)
        } else {
            fileHelper.deleteFile(files[id].path).then(() => {
                const { [id]: value, ...afterFiles } = files
                setFiles(afterFiles)
                saveFilesToStore(afterFiles)
                tabClose(id)
            })
        }
    }
    const updateFileName = (id, title, isNew) => {
        const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
        const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
        const newFiles = { ...files, [id]: modifiedFile }
        if (isNew) {
            fileHelper.writeFile(newPath, files[id].body).then(() => {
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        } else {
            const oldPath = files[id].path
            fileHelper.renameFile(oldPath, newPath).then(() => {
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        }
    }
    const fileSearch = keyword => {
        const newFiles = filesArr.filter(file => file.title.includes(keyword))
        setSearchedFiles(newFiles)
    }
    const creatNewFile = () => {
        const newId = uuidv4()
        const newFile = {
            id: newId,
            title: '',
            body: '## 请输入Markdown',
            createAd: new Date().getTime(),
            isNew: true,
        }
        setFiles({ ...files, [newId]: newFile })
    }
    const saveCurrentFile = () => {
        fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
            setUnsavedFileIds(unsavedFileIds.filter(id => id !== activeFileId))
        })
    }
    const importFiles = () => {
        remote.dialog.showOpenDialog({
            title: '选择导入的MarkDown文件',
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'MarkDown Files', extensions: ['md'] },
            ],
        }).then(ret => {
            const paths = ret.filePaths
            if (Array.isArray(paths)) {
                const filterPaths = paths.filter(path => {
                    const alreadyAdded = Object.values(files).find(file => file.path === path)
                    return !alreadyAdded
                })
                const importFiles = {}
                filterPaths.forEach(path => {
                    const id = uuidv4()
                    importFiles.id = {
                        id,
                        title: basename(path, extname(path)),
                        path,
                    }
                })
                const newFiles = { ...files, ...importFiles }
                setFiles(newFiles)
                saveFilesToStore(newFiles)
                if (filterPaths.length > 0) {
                    remote.dialog.showMessageBox({
                        type: 'info',
                        title: `成功导入了${filterPaths.length}个文件`,
                        message: `成功导入了${filterPaths.length}个文件`,
                    })
                }
            }
        })
    }
    useIpcRenderer({
        'create-new-file': creatNewFile,
        'import-file': importFiles,
        'save-edit-file': saveCurrentFile,
    })
    return (
        <div className="App container-fluid px-0">
            <div className="row no-gutters">
                <div className="col-3 bg-light left-panel">
                    <FileSearch
                        title='我的云文档'
                        onFileSearch={fileSearch}
                    />
                    <FileList
                        files={fileListArr}
                        onFileClick={fileClick}
                        onFileDelete={deleteFile}
                        onSaveEdit={updateFileName}
                    />
                    <div className="row no-gutters button-group">
                        <div className="col">
                            <BottomBtn
                                text="新建"
                                icon={faPlus}
                                colorClass="btn-primary"
                                onBtnClick={creatNewFile}
                            />
                        </div>
                        <div className="col">
                            <BottomBtn
                                text="导入"
                                icon={faFileImport}
                                colorClass="btn-success"
                                onBtnClick={importFiles}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-9 right-panel">
                    {
                        activeFile &&
                            <>
                                <TabList
                                    files={openedFiles}
                                    activedId={activeFileId}
                                    unsaveIds={unsavedFileIds}
                                    onTabClick={id => { tabClick(id) }}
                                    onTabClose={id => { tabClose(id) }}
                                />
                                <SimpleMDEEditor
                                    key={activeFileId}
                                    value={activeFile && activeFile.body}
                                    onChange={value => { fileChange(activeFileId, value) }}
                                    options={{
                                        minHeight: '515px',
                                    }}
                                />
                                <BottomBtn
                                    text="保存"
                                    icon={faFileImport}
                                    colorClass="btn-success"
                                    onBtnClick={saveCurrentFile}
                                />
                            </>
                    }
                    {
                        !activeFile &&
                        <div className="start-page">
                            选择或创建新的MarkDown文件
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default App
