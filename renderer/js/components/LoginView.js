// 登录视图组件
export const LoginView = {
  emits: ['login'],
  setup(props, { emit }) {
    const { ref, reactive } = Vue;
    
    // 状态数据
    const loading = ref(false);
    const error = ref('');
    const credentials = reactive({
      url: 'https://gitlab.com',
      token: ''
    });
    
    // 登录方法
    const login = async () => {
      try {
        if (!credentials.url || !credentials.token) {
          error.value = '请填写完整的GitLab信息';
          return;
        }
        
        loading.value = true;
        error.value = '';
        
        // 触发登录事件
        emit('login', {
          url: credentials.url,
          token: credentials.token
        });
      } catch (err) {
        error.value = '登录失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    return {
      credentials,
      loading,
      error,
      login
    };
  },
  template: `
    <div class="login-view">
      <div class="login-card">
        <h2 class="login-title">Git 管理工具</h2>
        <p class="login-subtitle">请输入GitLab信息以继续</p>
        
        <div class="form-group">
          <label class="form-label">GitLab URL</label>
          <input 
            type="text" 
            v-model="credentials.url" 
            class="form-input" 
            placeholder="例如: https://gitlab.com"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">访问令牌 (Access Token)</label>
          <input 
            type="password" 
            v-model="credentials.token" 
            class="form-input" 
            placeholder="请输入GitLab访问令牌"
          />
          <small class="form-help">
            访问令牌可以在GitLab个人设置中创建，需要api权限
          </small>
        </div>
        
        <button 
          class="btn btn-primary login-btn" 
          @click="login" 
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <div v-if="error" class="login-error">
          {{ error }}
        </div>
      </div>
    </div>
  `
};