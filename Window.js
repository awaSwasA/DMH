'use strict'

const { BrowserWindow } = require('electron')
var path = require('path')

const defaultProps = {
    width: 600,
    height: 450,
    show: false,
    icon: path.join(__dirname, 'images/icons8-monitor.png')
}

class Window extends BrowserWindow {
    constructor ({ file, ...windowSettings }) {
        super({ ...defaultProps, ...windowSettings})

        this.loadFile(file)
        // this.webContents.openDevTools()

        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = Window