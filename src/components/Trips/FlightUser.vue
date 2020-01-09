<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/flights' }">航班列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{flightName}}</el-breadcrumb-item>
      <el-breadcrumb-item>客户名单</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入客户名称内容"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getUserList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
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
        <el-table-column label="操作" width="120px">
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
              @click="removeUserFromHotel(scope.row.userId)"
            ></el-button>
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

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" ref="editFromRef" label-width="100px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editFrom.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="editFrom.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFrom.mobile" disabled></el-input>
        </el-form-item>

        <el-form-item label="所属酒店">
          <template>
            <el-select v-model="selectflightId" placeholder="请选择">
              <el-option
                v-for="item in hotelList"
                :key="item.flightId"
                :label="item.flightName"
                :value="item.flightId"
              ></el-option>
            </el-select>
          </template>
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
  data () {
    return {
      flightName: '',
      // 获取酒店信息
      hotelList: [],
      //选择酒店的id
      selectflightId: '',
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10,
        flightId: ''
      },
      userList: [],
      //总页数
      totalPage: 0,
      total: 0,
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
      //查询到的用户保存
      editFrom: {}
    }
  },
  watch: {
    selectflightId(val) {
      this.value = val
      this.addFrom.flightId = val
      this.editFrom.flightId = val
      console.log(this.addFrom)
    }
  },
  created() {
    this.quertInfo.flightId = this.$route.query.flightId
    this.flightName = this.$route.query.flightName

    this.getUserList()
  },
  methods: {
    async getAllHotelsMiniList() {
      const { data: res } = await this.$http.get('/mg/getAllHotelsMini')
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.hotelList = res.data
      console.log(res)
    },

    async getUserList() {
      const { data: res } = await this.$http.get('/mg/allUserByFlight', {
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

    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
      this.selectflightId = ''
    },

    // 展示用户编辑的对话框
    async showEditDialog(userId) {
      this.getAllHotelsMiniList()
      console.log(userId)
      const { data: res } = await this.$http.get('/user', {
        params: { userId: userId }
      })
      console.log(res)
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      var userInfo = res.data.userInfo
      var flights = res.data.flights

      this.editFrom = userInfo
      this.editFrom.userId = userInfo.userId + ''
      this.$message.success(res.errmsg)
    },

    // 监听修改用户对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
      this.selectflightId = ''
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
    async removeUserFromHotel(userId) {
      const confirmResult = await this.$confirm(
        '此操作将永久从酒店中删除该用户, 是否继续?',
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

      const { data: res } = await this.$http.post('/mg/userflightdelete', {
        userId: userId,
        flightId: this.quertInfo.flightId
      })
      if (res.errno !== '0') {
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
.flightInfoDiv {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;

  label:nth-child(1) {
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
