<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入内容"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getUserList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="性别">
          <template slot-scope="scope">{{scope.row.sex == 1 ? '男': '女'}}</template>
        </el-table-column>
        <el-table-column label="用户id" prop="userId"></el-table-column>
        <el-table-column label="领队状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.leader" @change="userManagerStateChanged(2,scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="管理员状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.manager" @change="userManagerStateChanged(1,scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.userId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUesrByUserId(scope.row.userId)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="quertInfo.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="quertInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题 -->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="70px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addFrom.userName"></el-input>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="addFrom.userId"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
        <el-form-item label="是否为管理员" prop="manager">
          <el-switch v-model="addFrom.manager"></el-switch>
        </el-form-item>
        <el-form-item label="是否为领队" prop="leader">
          <el-switch v-model="addFrom.leader"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="editFrom.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(1)[0-9]{10}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      userList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {
        userName: '',
        userId: '',
        mobile: '',
        manager: false,
        leader: false
      },
      //添加表单规则
      addFromRules: {
        userName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 20,
            message: '用户名长度在1-20之间'
          }
        ],
        userId: [
          {
            required: true,
            message: '请输入用户ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '用户ID长度在1-6之间'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 14,
            message: '手机号长度不正确',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      //查询到的用户保存
      editFrom: {},
      //添加表单规则
      editFromRules: {
        name: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 20,
            message: '用户名长度在1-20之间'
          }
        ],
        userId: [
          {
            required: true,
            message: '请输入用户ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '用ID长度在1-6之间'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 14,
            message: '手机号长度不正确',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('manager/users', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.userList = res.data.list
      if (res.data.currentPage < res.data.totalPage) {
        this.pageNum = res.data.currentPage + 1
      }
      this.totalPage = res.data.totalPage
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize 改变
    handleSizeChange(newSize) {
      this.quertInfo.pageSize = newSize
      this.getUserList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getUserList()
    },
    // 监听mamager
    async userManagerStateChanged(type, userInfo) {
      var u_state = type == 1 ? userInfo.manager : userInfo.leader

      const { data: res } = await this.$http.post('/manager/state', {
        userId: userInfo.userId,
        state: u_state,
        type: type
      })

      if (res.errno != '0') {
        if (type == 1) {
          userInfo.manager = !userInfo.manager
        } else {
          userInfo.leader = !userInfo.leader
        }

        return this.$message.error(res.errmsg)
      }
      this.$message.success(res.errmsg)
      console.log(res)
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加用户
    addUser() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('/register', this.addFrom)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addDialogVisible = false
        this.getUserList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示用户编辑的对话框
    async showEditDialog(userId) {
      console.log(userId)
      const { data: res } = await this.$http.get('/user', {
        params: { userId: userId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.userId = res.data.userId + ''
      console.log(res)
      this.$message.success(res.errmsg)
    },
    // 监听修改用户对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑用户
    editUserInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('/user/edit', this.editFrom)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getUserList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id 删除用户信息
    async removeUesrByUserId(userId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.post('/user/delete', {
        userId: userId
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getUserList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
</style>