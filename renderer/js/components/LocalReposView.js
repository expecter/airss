// 本地仓库视图组件
export const LocalReposView = {
  props: ['userConfig'],
  emits: ['update:config'],
  setup(props, { emit }) {
    const { ref, reactive, computed, onMounted } = Vue;
    
    // 状态数据
    const localRepos = ref([]);
    const loading = ref(false);
    const error = ref('');
    const searchQuery = ref('');
    const selectedRole = ref('all');
    const showAddModal = ref(false);
    const newRepo = reactive({
      name: '',
      path: '',
      role: 'developer',
      description: ''
    });
    
    // 职称列表
    const roles = [
      { id: 'all', name: '全部' },
      { id: 'developer', name: '开发工程师' },
      { id: 'tester', name: '测试工程师' },
      { id: 'designer', name: '设计师' },
      { id: 'pm', name: '项目经理' },
      { id: 'devops', name: '运维工程师' }
    ];
    
    // 过滤后的仓库列表
    const filteredRepos = computed(() => {
      return localRepos.value.filter(repo => {
        // 按职称筛选
        if (selectedRole.value !== 'all' && repo.role !== selectedRole.value) {
          return false;
        }
        
        // 按搜索关键词筛选
        if (searchQuery.value && !repo.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
            !repo.description.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    });
    
    // 加载本地仓库列表
    const loadLocalRepos = () => {
      localRepos.value = props.userConfig.localRepos || [];
    };
    
    // 选择本地Git目录
    const selectDirectory = async () => {
      try {
        const dirPath = await window.electron.ipcRenderer.invoke('select-directory');
        if (dirPath) {
          newRepo.path = dirPath;
          // 从路径中提取仓库名称
          const pathParts = dirPath.split(/[\\/]/);
          newRepo.name = pathParts[pathParts.length - 1];
        }
      } catch (err) {
        error.value = '选择目录失败: ' + err.message;
      }
    };
    
    // 打开仓库目录 - 根据环境提供不同实现
    const openRepoDirectory = (path) => {
      // 检查是否在Electron环境中
      if (window && window.process && window.process.type) {
        // Electron环境 - 这里可以添加使用Electron API打开目录的逻辑
        console.log('Electron环境打开目录:', path);
        // 这里可以添加使用shell.openPath等Electron API
      } else {
        // 浏览器环境 - 提供替代方案
        console.log('浏览器环境无法直接打开目录:', path);
        alert(`在浏览器环境中无法直接打开目录: ${path}`);
      }
    };
    
    // 添加本地仓库
    const addLocalRepo = async () => {
      try {
        if (!newRepo.name || !newRepo.path || !newRepo.role) {
          error.value = '请填写完整信息';
          return;
        }
        
        loading.value = true;
        error.value = '';
        
        // 检查路径是否存在
        // 这里可以添加检查目录是否为Git仓库的逻辑
        
        // 添加到配置中
        const updatedRepos = [...localRepos.value, {
          id: Date.now().toString(),
          name: newRepo.name,
          path: newRepo.path,
          role: newRepo.role,
          description: newRepo.description,
          addedAt: new Date().toISOString()
        }];
        
        // 更新配置
        const updatedConfig = {
          ...props.userConfig,
          localRepos: updatedRepos
        };
        
        await window.electron.ipcRenderer.invoke('save-user-config', updatedConfig);
        emit('update:config', updatedConfig);
        
        // 重置表单
        newRepo.name = '';
        newRepo.path = '';
        newRepo.role = 'developer';
        newRepo.description = '';
        
        // 关闭模态框
        showAddModal.value = false;
        
        // 重新加载列表
        loadLocalRepos();
      } catch (err) {
        error.value = '添加仓库失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    // 删除本地仓库
    const removeLocalRepo = async (repoId) => {
      try {
        if (!confirm('确定要删除这个仓库吗？这不会删除磁盘上的文件，只会从列表中移除。')) {
          return;
        }
        
        loading.value = true;
        error.value = '';
        
        // 从列表中移除
        const updatedRepos = localRepos.value.filter(repo => repo.id !== repoId);
        
        // 更新配置
        const updatedConfig = {
          ...props.userConfig,
          localRepos: updatedRepos
        };
        
        await window.electron.ipcRenderer.invoke('save-user-config', updatedConfig);
        emit('update:config', updatedConfig);
        
        // 重新加载列表
        loadLocalRepos();
      } catch (err) {
        error.value = '删除仓库失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    // 这里已经在上面定义了更完善的openRepoDirectory函数
    // 不需要重复定义
    
    // 生命周期钩子
    onMounted(() => {
      loadLocalRepos();
    });
    
    return {
      localRepos,
      filteredRepos,
      loading,
      error,
      searchQuery,
      selectedRole,
      roles,
      showAddModal,
      newRepo,
      selectDirectory,
      addLocalRepo,
      removeLocalRepo,
      openRepoDirectory
    };
  },
  template: `
    <div class="local-repos-view">
      <div class="card">
        <div class="card-title">本地Git仓库管理</div>
        <div class="card-content">
          <div class="toolbar">
            <div class="search-filter">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索仓库..." 
                class="form-input"
              />
              <select v-model="
              `
}