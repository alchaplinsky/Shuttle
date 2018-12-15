// Import libs
const { app, shell, ipcMain, Notification, globalShortcut } = require('electron')
const menubar = require('menubar')
const AutoLaunch = require('auto-launch')
const electronLocalshortcut = require('electron-localshortcut')

require('./main/events.js')
const contextMenu = require('./main/menu.js')
const autoUpdater = require('./main/updater.js')
const files = require('./app/modules/files.js')

let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle'
})

if (files.settings.getValue('settings.autostart') === true || files.settings.getValue('settings.autostart') === undefined) {  
  ShuttleAutoLauncher.enable()
} else {
  ShuttleAutoLauncher.disable()
}

// set window variable
let mb

const shuttle = {
  // create window
  createAppWindows () {
    mb = new menubar({
      icon: require.resolve(`./main/icon.png`),
      index: `file://${__dirname}/app/index.html`,
      width: 395,
      minWidth: 395,
      height: 645,
      minHeight: 645,
      title: 'Shuttle',
      autoHideMenuBar: true,
      frame: false,
      skipTaskbar: true,
      backgroundColor: '#ffffff',
      preloadWindow: true,
      alwaysOnTop: files.settings.getValue('settings.StayOpen') || false,
      resizable: false,
      webPreferences: {
        webSecurity: false,
        'overlay-fullscreen-video': true,
        webaudio: true,
        webgl: true,
        textAreasAreResizable: true
      }
    })
  }
}

app.on('ready', () => {
  shuttle.createAppWindows()
  mb.tray.setContextMenu(contextMenu)
  mb.showWindow()
  mb.window.setMenu(null)
  mb.window.openDevTools()
  app.on('before-quit', () => {
    mb.window.removeAllListeners('close')
    mb.window.close()
  })

  globalShortcut.register('CmdOrCtrl+Shift+X', () => {
    if (mb.window.isVisible()) {
      mb.hideWindow()
      console.log('hide window')
    } else {
      mb.showWindow()
      console.log('show window')
    }
  })

  electronLocalshortcut.register(mb.window, 'Escape', () => {
    mb.window.webContents.send('SHORTCUT_QUIT_FULLSCREEN')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+P', () => {
    mb.window.webContents.send('SHORTCUT_ADD_BOOKMARK')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+H', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_MAIN')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+S', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_SETTING')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+K', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_QUICKSERACH')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Shift+S', () => {
    mb.window.webContents.send('SHORTCUT_MAKE_SCREENSHOT')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Shift+I', () => {
    mb.window.openDevTools()
  })

})

EventsEmitter.on('SHOW_SHUTTLE', () => {
  mb.showWindow()
})

EventsEmitter.on('SHOW_ABOUT', () => {
  shell.openExternal('https://shuttleapp.io/about')
})

EventsEmitter.on('SHOW_SETTINGS', () => {
  mb.window.webContents.send('SHORTCUT_SHOW_SETTING')
})

EventsEmitter.on('QUIT_SHUTTLE', () => {
  app.quit()
})

ipcMain.on('PAGE_ALERT', (event, data) => {
  mb.window.webContents.send('ALERT', data)
})

ipcMain.on('SettingSetAlwaysOnTop', (event, arg) => {
  mb.setOption('alwaysOnTop', arg)
  mb.hideWindow()
  setTimeout(() => {
    mb.showWindow()
  }, 5)
})
