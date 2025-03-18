// 设置视图组件
export const SettingsView = {
  props: ['userConfig'],
  emits: ['update:config'],
  setup(props, { emit }) {
    const { ref, reactive, onMounted } = Vue;
    
    // 状态数据
    const loading = ref(false);
    const error = ref('');
    const success = ref('');
    const settings = reactive({
      defaultRole: 'developer',
      autoFetch: true,
      darkMode: false
    });
    
    // 职称列表
    const roles = [
      { id: 'developer', name: '开发工程师' },
      { id: 'tester', name: '测试工程师' },
      { id: 'designer', name: '设计师' },
      { id: 'pm', name: '项目经理' },
      { id: 'devops', name: '运维工程师' }
    ];
    
    // 加载设置
    const loadSettings = () => {
      // 从用户配置中获取设置
      if (props.userConfig.settings) {
        settings.defaultRole = props.userConfig.settings.defaultRole || 'developer';
        settings.autoFetch = props.userConfig.settings.autoFetch !== false;
        settings.darkMode = props.userConfig.settings.darkMode || false;
      }
    };
    
    // 保存设置
    const saveSettings = async () => {
      try {
        loading.value = true;
        error.value = '';
        success.value = '';
        
        // 更新配置
        const updatedConfig = {
          ...props.userConfig,
          settings: {
            defaultRole: settings.defaultRole,
            autoFetch: settings.autoFetch,
            darkMode: settings.darkMode
          }
        };
        
        await window.electron.ipcRenderer.invoke('save-user-config', updatedConfig);
        emit('update:config', updatedConfig);
        
        success.value = '设置已保存';
      } catch (err) {
        error.value = '保存设置失败: ' + err.message;
      } finally {
        loading.value = false;
        
        // 3秒后清除成功消息
        if (success.value) {
          setTimeout(() => {
            success.value = '';
          }, 3000);
        }
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      loadSettings();
    });
    
    return {
      settings,
      roles,
      loading,
      error,
      success,
      saveSettings
    };
  },
  template: `
    <div class="settings-view">
      <div class="card">
        <div class="card-title">应用设置</div>
        <div class="card-content">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
          </div>
          
          <div v-else>
            <div class="form-group">
              <label class="form-label">默认职称</label>
              <select v-model="settings.defaultRole" class="form-input">
                <option v-for="role in roles" :value="role.id">{{ role.name }}</option>
              </select>
              <small class="form-help">添加新项目或仓库时的默认职称</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">自动获取</label>
              <div class="toggle-switch">
                <input type="checkbox" v-model="settings.autoFetch" id="autoFetch" />
                <label for="autoFetch"></label>
              </div>
              <small class="form-help">启动应用时自动从GitLab获取项目</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">深色模式</label>
              <div class="toggle-switch">
                <input type="checkbox" v-model="settings.darkMode" id="darkMode" />
                <label for="darkMode"></label>
              </div>
              <small class="form-help">启用深色主题（需要重启应用）</small>
            </div>
            
            <button class="btn btn-primary" @click="saveSettings" :disabled="loading">
              保存设置
            </button>
            
            <div v-if="success" class="success-message">
              {{ success }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `
};