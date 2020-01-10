<template>
  <el-col>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/clockin' }">景点列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{name}}</el-breadcrumb-item>
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
        <el-col :span="4">
          <label style="height:40px;line-height:40px;margin-right:30px" for="">是否展示缩略图</label>
            <el-switch v-model="showPicMini"></el-switch>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="用户id" prop="userId"></el-table-column>

        <el-table-column label="图片缩略图" v-if="showPicMini" width="300px">
          <template slot-scope="scope">
            <img class="miniPic" :src="scope.row.clockInUrl" alt />
          </template>
        </el-table-column>

        <el-table-column label="图片链接" prop="clockInUrl"></el-table-column>
        <el-table-column label="通过审核">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isAudit" @change="userAuditStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="审核状态">
          <template slot-scope="scope">
            <label
              :class="scope.row.auditStatus?'isAuditLabel':'notAuditLabel'"
            >{{scope.row.auditStatus ? "已审核": "未审核"}}</label>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="openPicView(scope.row)"
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
    <!-- 侧滑页面 图片预览 -->
    <el-drawer title="我是标题" :visible.sync="drawer" :with-header="false">
      <div class="drawerDiv">
        <span>{{name}}</span>
        <img class="picImg" :src="curreutUser.clockInUrl" />

        <span>通过审核</span>
        <el-switch v-model="curreutUser.isAudit" @change="userAuditStateChanged(curreutUser)"></el-switch>
        <span>审核状态</span>
        <label
          :class="curreutUser.auditStatus?'isAuditLabel':'notAuditLabel'"
        >{{curreutUser.auditStatus ? "已审核": "未审核"}}</label>
      </div>
    </el-drawer>

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

        <el-form-item label="所属景点">
          <template>
            <el-select v-model="selectAttractionId" placeholder="请选择">
              <el-option
                v-for="item in hotelList"
                :key="item.attractionsId"
                :label="item.hotelName"
                :value="item.attractionsId"
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
  </el-col>
</template>

<script>
export default {
  data() {
    return {
      curreutUser: Object,
      drawer: false,
      multipleSelection: [],
      name: '',
      // 获取景点信息
      hotelList: [],
      //选择景点的id
      selectAttractionId: '',
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10,
        attractionsId: ''
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
      editFrom: {},
      showPicMini: true
    }
  },
  watch: {
    selectAttractionId(val) {
      this.value = val
      this.addFrom.attractionsId = val
      this.editFrom.attractionsId = val
      console.log(this.addFrom)
    }
  },
  created() {
    this.quertInfo.attractionsId = this.$route.query.attractionsId
    this.name = this.$route.query.name

    this.getUserList()
  },
  methods: {
    // 打开图片预览
    openPicView(user) {
      this.curreutUser = user
      this.drawer = true
    },
    async userAuditStateChanged(info) {
      const { data: res } = await this.$http.post('/mg/userAttractionStatus', {
        userId: info.userId,
        attractionsId: this.quertInfo.attractionsId,
        isAudit: info.isAudit
      })
      this.getUserList()

      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    async getUserList() {
      const { data: res } = await this.$http.get(
        '/mg/allUserByClockInAttraction',
        {
          params: this.quertInfo
        }
      )
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
      this.selectAttractionId = ''
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
      this.selectAttractionId = ''
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
        '此操作将永久从景点中删除该用户, 是否继续?',
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

      const { data: res } = await this.$http.post('/mg/userAttractionDelete', {
        userId: userId,
        attractionsId: this.quertInfo.attractionsId
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
.picImg {
  box-sizing: border-box;
  width: 100%;
}
.el-drawer {
  span {
    font-size: 40px;
    margin-bottom: 25px;
    margin-top: 25px;
  }
}
.isAuditLabel {
  color: green;
}
.notAuditLabel {
  color: red;
}
.drawerDiv {
  width: 100%;
  padding: 0px 50px;
  display: flex;
  flex-direction: column;
}
.miniPic {
  width: 100%;
}
</style>
