import { useRef, useEffect } from 'react'
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const useContextMenu = (itemArr, selector, deps) => {
    const clickElement = useRef(null)
    const menu = new Menu()
    useEffect(() => {
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        })
        const handleContextmenu = e => {
            clickElement.current = e.target
            if (document.querySelector(selector).contains(e.target)) {
                menu.popup({
                    window: remote.getCurrentWindow(),
                })
            }
        }
        window.addEventListener('contextmenu', handleContextmenu)
        return () => {
            window.removeEventListener('contextmenu', handleContextmenu)
        }
    }, [deps])
    return clickElement
}

export default useContextMenu