// 浏览器兼容层 - 模拟Electron API

// 创建模拟的electron对象
const createBrowserElectron = () => {
  // 本地存储模拟electron-store
  const store = {
    _data: JSON.parse(localStorage.getItem('electron-store') || '{}'),
    get: function(key) {
      return key ? this._data[key] : this._data;
    },
    set: function(key, value) {
      if (typeof key === 'object') {
        this._data = { ...this._data, ...key };
      } else {
        this._data[key] = value;
      }
      localStorage.setItem('electron-store', JSON.stringify(this._data));
      return true;
    }
  };

  // 模拟ipcRenderer
  const ipcRenderer = {
    // 模拟invoke方法
    invoke: async (channel, ...args) => {
      console.log(`Browser compat: ipcRenderer.invoke called with channel: ${channel}`);
      
      // 处理不同的channel
      switch (channel) {
        case 'get-user-config':
          return store.get('userConfig') || {};
          
        case 'save-user-config':
          store.set('userConfig', args[0]);
          return { success: true };
          
        case 'select-directory':
          // 浏览器环境无法选择目录，使用模拟对话框
          return new Promise((resolve) => {
            const mockPath = prompt('请输入目录路径（浏览器模式下无法真正选择目录）：', 'C:\\模拟目录\\项目名');
            resolve(mockPath || null);
          });
          
        default:
          console.warn(`未实现的channel: ${channel}`);
          return null;
      }
    },
    
    // 模拟事件监听方法
    on: (channel, func) => {
      console.log(`Browser compat: ipcRenderer.on registered for channel: ${channel}`);
      // 浏览器环境中不做实际操作
    },
    
    once: (channel, func) => {
      console.log(`Browser compat: ipcRenderer.once registered for channel: ${channel}`);
      // 浏览器环境中不做实际操作
    },
    
    removeListener: (channel, func) => {
      console.log(`Browser compat: ipcRenderer.removeListener called for channel: ${channel}`);
      // 浏览器环境中不做实际操作
    }
  };

  return {
    ipcRenderer
  };
};

// 检测是否在Electron环境中
const isElectron = () => {
  return window && window.process && window.process.type;
};

// 导出electron对象（根据环境选择真实的或模拟的）
if (!isElectron()) {
  // 在浏览器环境中，使用Object.defineProperty安全地定义electron属性
  if (!window.electron) {
    Object.defineProperty(window, 'electron', {
      value: createBrowserElectron(),
      writable: false,
      configurable: true
    });
  }
}

// 导出环境检测函数
export const isElectronEnv = isElectron;