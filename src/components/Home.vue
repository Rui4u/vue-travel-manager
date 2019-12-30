<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ?'64px' : '200px'">
        <div class="toggle-button" @click="clickToggle">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板文件 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subChild.path"
              v-for="subChild in item.child"
              :key="subChild.id"
              @click="saveNavState('/' + subChild.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subChild.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconObj: {
        '100': 'iconfont icon-user',
        '200': 'iconfont icon-tijikongjian',
        '300': 'iconfont icon-tijikongjian',
        '400': 'iconfont icon-tijikongjian',
        '500': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 激活状态
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('manager/menu')
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.menulist = res.data
      console.log(res)
    },
    // 切换菜单 折叠与展开
    clickToggle() {
      this.isCollapse = !this.isCollapse
    },
    // 链接激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;

  align-items: center;
  color: #ffffff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      height: 40px;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
    .el-submenu {
      span {
        margin-left: 10px;
      }
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  color: #ffffff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style> 
