const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

// 开发环境判断
const isDev = process.argv.includes('--dev');

// 禁用GPU加速，解决GPU进程崩溃问题
app.disableHardwareAcceleration();

// 添加命令行开关以禁用GPU相关功能
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 主窗口引用
let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      offscreen: false
    },
    // 禁用框架中的GPU加速
    backgroundColor: '#fff',
    show: true
  });

  // 加载主页面
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 开发环境打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 应用激活时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理

// 获取用户配置
ipcMain.handle('get-user-config', () => {
  return store.get('userConfig') || {};
});

// 保存用户配置
ipcMain.handle('save-user-config', (event, config) => {
  store.set('userConfig', config);
  return { success: true };
});

// 选择本地Git目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});