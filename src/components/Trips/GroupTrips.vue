<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>行程管理</el-breadcrumb-item>
      <el-breadcrumb-item>团队列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入团队名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllGroupTripList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllGroupTripList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGroupTripDialogVisible = true">添加团队</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="allGroupTripList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="团队描述" prop="desc"></el-table-column>       
        <el-table-column label="团队ID" prop="tripId"></el-table-column> 

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showGroupTripEditDialog(scope.row.tripId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeFlightById(scope.row.tripId)"
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
    <el-dialog
      title="添加用户"
      :visible.sync="addGroupTripDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="团队描述" prop="desc">
          <el-input v-model="addFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="团队ID" prop="tripId">
          <el-input v-model="addFrom.tripId"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGroupTripDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGroupTrip">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="团队描述" prop="desc">
          <el-input v-model="editFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="团队ID" prop="tripId">
          <el-input v-model="editFrom.tripId" disabled></el-input>
        </el-form-item>
       
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFlightInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
   
    return {
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      allGroupTripList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addGroupTripDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {},
      //添加表单规则
      fromRules: {
        desc: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        tripId: [
          {
            required: true,
            message: '请输入航班ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '航空ID长度在1-6之间'
          }
        ]
      },
      //查询到的航班信息保存
      editFrom: {},
    }
  },
  created() {
    this.getAllGroupTripList()
  },
  methods: {
    async getAllGroupTripList() {
      const { data: res } = await this.$http.get('/mg/getAllGroupTrip', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allGroupTripList = res.data.list
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
      this.getAllGroupTripList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllGroupTripList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加团队
    addGroupTrip() {
      this.$refs.addFromRef.validate(async valid => {
        console.log(valid)
        if (!valid) return

        const { data: res } = await this.$http.post('/mg/addGroupTrip', this.addFrom)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addGroupTripDialogVisible = false
        this.getAllGroupTripList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示用户编辑的对话框
    async showGroupTripEditDialog(tripId) {
      const { data: res } = await this.$http.get('/mg/getGroupTrip', {
        params: { tripId: tripId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.tripId = res.data.tripId + ''
      console.log(res)
      this.$message.success(res.errmsg)
    },
    // 监听修改用户对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑用户
    editFlightInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/editGroupTrip',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllGroupTripList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除航班信息
    async removeFlightById(tripId) {
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

      const { data: res } = await this.$http.post('/mg/deleteGroupTrip', {
        tripId: tripId
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllGroupTripList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>