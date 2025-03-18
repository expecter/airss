// 导入组件
import { LoginView } from './components/LoginView.js';
import { DashboardView } from './components/DashboardView.js';
import { ProjectsView } from './components/ProjectsView.js';
import { LocalReposView } from './components/LocalReposView.js';
import { SettingsView } from './components/SettingsView.js';
import { isElectronEnv } from './browser-compat.js';

// 创建Vue应用
const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
  setup() {
    // 状态管理
    const isLoggedIn = ref(false);
    const currentView = ref('login');
    const userConfig = ref({});
    const loading = ref(false);
    const error = ref('');
    
    // 计算属性
    const currentComponent = computed(() => {
      switch(currentView.value) {
        case 'login': return LoginView;
        case 'dashboard': return DashboardView;
        case 'projects': return ProjectsView;
        case 'localRepos': return LocalReposView;
        case 'settings': return SettingsView;
        default: return LoginView;
      }
    });
    
    // 方法
    const changeView = (view) => {
      currentView.value = view;
    };
    
    const handleLogin = async (credentials) => {
      try {
        loading.value = true;
        error.value = '';
        
        // 保存GitLab配置
        await window.electron.ipcRenderer.invoke('save-user-config', {
          ...userConfig.value,
          gitlab: credentials
        });
        
        isLoggedIn.value = true;
        currentView.value = 'dashboard';
      } catch (err) {
        error.value = '登录失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    const handleLogout = () => {
      isLoggedIn.value = false;
      currentView.value = 'login';
    };
    
    // 生命周期钩子
    onMounted(async () => {
      try {
        // 获取用户配置
        const config = await window.electron.ipcRenderer.invoke('get-user-config');
        userConfig.value = config;
        
        // 如果已有GitLab配置，自动登录
        if (config.gitlab && config.gitlab.token) {
          isLoggedIn.value = true;
          currentView.value = 'dashboard';
        }
        
        // 检测并显示当前运行环境
        console.log(`当前运行环境: ${isElectronEnv() ? 'Electron桌面应用' : '浏览器'}`);
      } catch (err) {
        console.error('加载配置失败:', err);
      }
    });
    
    return {
      isLoggedIn,
      currentView,
      currentComponent,
      userConfig,
      loading,
      error,
      changeView,
      handleLogin,
      handleLogout
    };
  },
  template: `
    <div class="app-container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
      </div>
      
      <template v-else>
        <!-- 导航栏 -->
        <nav v-if="isLoggedIn" class="navbar">
          <div class="navbar-brand">Git 管理工具</div>
          <div class="navbar-menu">
            <button class="btn btn-secondary" @click="handleLogout">退出登录</button>
          </div>
        </nav>
        
        <!-- 主内容区 -->
        <div class="main-container">
          <!-- 侧边栏 -->
          <div v-if="isLoggedIn" class="sidebar">
            <div class="sidebar-title">菜单</div>
            <ul class="sidebar-menu">
              <li 
                class="sidebar-menu-item" 
                :class="{ active: currentView === 'dashboard' }"
                @click="changeView('dashboard')"
              >
                仪表盘
              </li>
              <li 
                class="sidebar-menu-item" 
                :class="{ active: currentView === 'projects' }"
                @click="changeView('projects')"
              >
                GitLab 项目
              </li>
              <li 
                class="sidebar-menu-item" 
                :class="{ active: currentView === 'localRepos' }"
                @click="changeView('localRepos')"
              >
                本地仓库
              </li>
              <li 
                class="sidebar-menu-item" 
                :class="{ active: currentView === 'settings' }"
                @click="changeView('settings')"
              >
                设置
              </li>
            </ul>
          </div>
          
          <!-- 内容区 -->
          <div class="content">
            <component 
              :is="currentComponent" 
              :user-config="userConfig"
              @login="handleLogin"
              @update:config="userConfig = $event"
            />
          </div>
        </div>
      </template>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `
});

// 挂载应用
app.mount('#app');

// 设置IPC渲