// 仪表盘视图组件
export const DashboardView = {
  props: ['userConfig'],
  setup(props) {
    const { ref, computed, onMounted } = Vue;
    
    // 状态数据
    const loading = ref(false);
    const error = ref('');
    const stats = ref({
      totalProjects: 0,
      totalLocalRepos: 0,
      projectsByRole: {}
    });
    
    // 职称列表
    const roles = [
      { id: 'developer', name: '开发工程师', color: '#0366d6' },
      { id: 'tester', name: '测试工程师', color: '#28a745' },
      { id: 'designer', name: '设计师', color: '#6f42c1' },
      { id: 'pm', name: '项目经理', color: '#e36209' },
      { id: 'devops', name: '运维工程师', color: '#d73a49' }
    ];
    
    // 计算统计数据
    const calculateStats = () => {
      const localRepos = props.userConfig.localRepos || [];
      const gitlabProjects = props.userConfig.gitlabProjects || [];
      
      // 统计本地仓库数量
      stats.value.totalLocalRepos = localRepos.length;
      
      // 统计GitLab项目数量
      stats.value.totalProjects = gitlabProjects.length;
      
      // 按职称统计项目
      const projectsByRole = {};
      
      // 初始化各职称的计数
      roles.forEach(role => {
        projectsByRole[role.id] = {
          local: 0,
          gitlab: 0,
          total: 0
        };
      });
      
      // 统计本地仓库
      localRepos.forEach(repo => {
        if (projectsByRole[repo.role]) {
          projectsByRole[repo.role].local++;
          projectsByRole[repo.role].total++;
        }
      });
      
      // 统计GitLab项目
      gitlabProjects.forEach(project => {
        if (projectsByRole[project.role]) {
          projectsByRole[project.role].gitlab++;
          projectsByRole[project.role].total++;
        }
      });
      
      stats.value.projectsByRole = projectsByRole;
    };
    
    // 生命周期钩子
    onMounted(() => {
      try {
        loading.value = true;
        calculateStats();
      } catch (err) {
        error.value = '加载统计数据失败: ' + err.message;
      } finally {
        loading.value = false;
      }
    });
    
    return {
      stats,
      roles,
      loading,
      error
    };
  },
  template: `
    <div class="dashboard-view">
      <div class="card">
        <div class="card-title">仪表盘</div>
        <div class="card-content">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
          </div>
          
          <div v-else>
            <!-- 总览统计 -->
            <div class="stats-overview">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalProjects }}</div>
                <div class="stat-label">GitLab 项目</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalLocalRepos }}</div>
                <div class="stat-label">本地仓库</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalProjects + stats.totalLocalRepos }}</div>
                <div class="stat-label">总项目数</div>
              </div>
            </div>
            
            <!-- 按职称统计 -->
            <div class="role-stats">
              <h3>按职称统计</h3>
              <div class="role-stats-grid">
                <div v-for="role in roles" :key="role.id" class="role-stat-card" :style="{ borderColor: role.color }">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-counts">
                    <div class="count-item">
                      <span class="count-value">{{ stats.projectsByRole[role.id]?.gitlab || 0 }}</span>
                      <span class="count-label">GitLab</span>
                    </div>
                    <div class="count-item">
                      <span class="count-value">{{ stats.projectsByRole[role.id]?.local || 0 }}</span>
                      <span class="count-label">本地</span>
                    </div>
                    <div class="count-item">
                      <span class="count-value">{{ stats.projectsByRole[role.id]?.total || 0 }}</span>
                      <span class="count-label">总计</span>
                    </div>
                  </div>
                </div>
              </div>
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
}