// GitLab项目视图组件
export const ProjectsView = {
  props: ['userConfig'],
  emits: ['update:config'],
  setup(props, { emit }) {
    const { ref, reactive, computed, onMounted } = Vue;
    
    // 状态数据
    const projects = ref([]);
    const loading = ref(false);
    const error = ref('');
    const searchQuery = ref('');
    const selectedRole = ref('all');
    const showEditModal = ref(false);
    const editingProject = reactive({
      id: '',
      name: '',
      description: '',
      role: 'developer',
      url: ''
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
    
    // 过滤后的项目列表
    const filteredProjects = computed(() => {
      return projects.value.filter(project => {
        // 按职称筛选
        if (selectedRole.value !== 'all' && project.role !== selectedRole.value) {
          return false;
        }
        
        // 按搜索关键词筛选
        if (searchQuery.value && !project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
            !project.description.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    });
    
    // 加载GitLab项目列表
    const loadProjects = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        // 从配置中获取已保存的项目
        projects.value = props.userConfig.gitlabProjects || [];
        
        // 这里可以添加从GitLab API获取项目的逻辑
        // 使用props.userConfig.gitlab中的url和token访问GitLab API
      } catch (err) {
        error.value = '加载项目失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    // 编辑项目
    const editProject = (project) => {
      // 复制项目数据到编辑表单
      editingProject.id = project.id;
      editingProject.name = project.name;
      editingProject.description = project.description || '';
      editingProject.role = project.role || 'developer';
      editingProject.url = project.web_url || '';
      
      // 显示编辑模态框
      showEditModal.value = true;
    };
    
    // 保存项目编辑
    const saveProjectEdit = async () => {
      try {
        if (!editingProject.name || !editingProject.role) {
          error.value = '请填写完整信息';
          return;
        }
        
        loading.value = true;
        error.value = '';
        
        // 更新项目数据
        const updatedProjects = projects.value.map(project => {
          if (project.id === editingProject.id) {
            return {
              ...project,
              name: editingProject.name,
              description: editingProject.description,
              role: editingProject.role
            };
          }
          return project;
        });
        
        // 更新配置
        const updatedConfig = {
          ...props.userConfig,
          gitlabProjects: updatedProjects
        };
        
        await window.electron.ipcRenderer.invoke('save-user-config', updatedConfig);
        emit('update:config', updatedConfig);
        
        // 关闭模态框
        showEditModal.value = false;
        
        // 重新加载列表
        loadProjects();
      } catch (err) {
        error.value = '保存项目失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      loadProjects();
    });
    
    return {
      projects,
      filteredProjects,
      loading,
      error,
      searchQuery,
      selectedRole,
      roles,
      showEditModal,
      editingProject,
      editProject,
      saveProjectEdit
    };
  },
  template: `
    <div class="projects-view">
      <div class="card">
        <div class="card-title">GitLab 项目管理</div>
        <div class="card-content">
          <div class="toolbar">
            <div class="search-filter">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索项目..." 
                class="form-input"
              />
              <select v-model="selectedRole" class="form-input">
                <option v-for="role in roles" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
          </div>
          
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
          </div>
          
          <div v-else-if="filteredProjects.length === 0" class="empty-state">
            <p>暂无符合条件的项目</p>
          </div>
          
          <div v-else class="project-list">
            <div v-for="project in filteredProjects" :key="project.id" class="project-card">
              <div class="project-title">{{ project.name }}</div>
              <div class="project-description">{{ project.description || '无描述' }}</div>
              <div class="project-meta">
                <span class="tag tag-role">{{ roles.find(r => r.id === project.role)?.name || '未分类' }}</span>
              </div>
              <div class="project-actions">
                <a :href="project.web_url" target="_blank" class="btn btn-secondary">访问项目</a>
                <button class="btn btn-primary" @click="editProject(project)">编辑</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 编辑项目模态框 -->
      <div v-if="showEditModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">编辑项目</div>
            <button class="modal-close" @click="showEditModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="editingProject.description" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
            <button class="btn btn-primary" @click="saveProjectEdit">保存</button>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  
              <label class="form-label">项目名称</label>
              <input type="text" v-model="editingProject.name" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="editingProject.description" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
            <button class="btn btn-primary" @click="saveProjectEdit">保存</button>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  
              <label class="form-label">职称分类</label>
              <select v-model="editingProject.role" class="form-input">
                <option v-for="role in roles.slice(1)" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="editingProject.description" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
            <button class="btn btn-primary" @click="saveProjectEdit">保存</button>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `
}