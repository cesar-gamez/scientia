// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// function createWindow() {
//   const win = new BrowserWindow({
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });
//   win.loadFile('index.html');
// }

// app.whenReady().then(createWindow);

// // Handle IPC calls
// ipcMain.handle('app:get-version', () => app.getVersion());


// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// // Function to open browser
// function openBrowser(url) {
//   shell.openExternal(url)
// }




// Highlighting Functionalities
let outputElement;

function getSelectedText() {
    return window.getSelection().toString().trim();
}

function outputSelectedText() {
    const selectedText = getSelectedText();
    
    if (selectedText) {
        if (outputElement) {
            outputElement.textContent =  selectedText;
        }
        console.log(selectedText);
    } else {
        if (outputElement) {
            outputElement.textContent = 'No text currently selected';
        }
        console.log('No text currently selected');
    }
}

function setupEventListeners() {
  document.addEventListener('keyup', function(e) {
      // if (e.ctrlKey && e.shiftKey && e.keyCode === 72) {
      //     outputSelectedText();
      // }

      if (e.key === 'Shift') {
          outputSelectedText();
      }
      
  });
}

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});