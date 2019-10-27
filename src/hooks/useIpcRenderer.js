import { useEffect } from 'react'
const { ipcRenderer } = window.require('electron')

const useIpcRenderer = (keyCallbakMap) => {
    useEffect(() => {
        Object.keys(keyCallbakMap).forEach(key => {
            ipcRenderer.on(key, keyCallbakMap[key])
        })
        return () => {
            Object.keys(keyCallbakMap).forEach(key => {
                ipcRenderer.removeListener(key, keyCallbakMap[key])
            })
        }
    })
}
export default useIpcRenderer