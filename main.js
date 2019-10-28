const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
let mainWindow
let settingsWindow

app.on('ready', () => {
    const ulrLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}`
    const mainWindowConfig = {
        width: 1024,
        height: 680,
    }
    mainWindow = new AppWindow(mainWindowConfig, ulrLocation)
    mainWindow.on('closed', () => {
        mainWindow = null
    })
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow,
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
})