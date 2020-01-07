<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>行程管理</el-breadcrumb-item>
      <el-breadcrumb-item>路线列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入路线名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllRouteList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllRouteList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addRouteOpen">添加路线</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="allRoutesList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="日期" prop="date"></el-table-column>
        <el-table-column label="时间" prop="time"></el-table-column>
        <el-table-column label="描述" prop="desc"></el-table-column>
        <el-table-column label="所属日程ID" prop="dayId"></el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showRouteEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRouteById(scope.row.id)"
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
      :visible.sync="addRouteDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-input v-model="addFrom.date"></el-input>
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-input v-model="addFrom.time"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="addFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="所属日程" prop="dayId">
          <template>
            <el-select v-model="selectDayId" placeholder="请选择">
              <el-option
                v-for="item in allDaysList"
                :key="item.dayId"
                :label="item.daysTitle"
                :value="item.dayId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRouteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoute">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-input v-model="editFrom.date"></el-input>
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-input v-model="editFrom.time"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="editFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="所属日程" prop="dayId">
          <template>
            <el-select v-model="selectDayId" placeholder="请选择">
              <el-option
                v-for="item in allDaysList"
                :key="item.dayId"
                :label="item.daysTitle"
                :value="item.dayId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRouteInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkDate = (rule, value, cb) => {
      const checkDate = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/
      if (checkDate.test(value)) {
        return cb()
      }
      cb(new Error('日期格式不正确，正确格式为：2020-01-01'))
    }
    return {
      allDaysList: [],
      selectDayId: '',
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      allRoutesList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addRouteDialogVisible: false,
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
        time: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        date: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          },
          {
            validator: checkDate,
            trigger: 'blur'
          }
        ]
      },
      //查询到的航班信息保存
      editFrom: {}
    }
  },
  created() {
    this.getAllRouteList()
  },
  methods: {
    // 获取所有日程列表
    async getAllDaysList() {
      const { data: res } = await this.$http.get('/mg/getAllDaysTripMini')
      if (res.errno != '0') {
        return this.$message.error(res1.errmsg)
      }
      this.allDaysList = res.data
      console.log(res)
    },
    addRouteOpen() {
      this.getAllDaysList()
      console.log(111)
      this.addRouteDialogVisible = true
    },
    async getAllRouteList() {
      const { data: res } = await this.$http.get('/mg/getAllRoutes', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allRoutesList = res.data.list
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
      this.getAllRouteList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllRouteList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加行程
    addRoute() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/addRoute',
          this.addFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.getAllDaysList()

        this.selectDayId = res.data.dayId

        this.addRouteDialogVisible = false
        this.getAllRouteList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示用户编辑的对话框
    async showRouteEditDialog(id) {
      const { data: res } = await this.$http.get('/mg/getRoute', {
        params: { id: id }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }

      this.getAllDaysList()
      this.selectDayId = res.data.dayId

      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.id = res.data.id + ''

      this.$message.success(res.errmsg)
    },
    // 监听修改用户对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑用户
    editRouteInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/RouteEdit',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllRouteList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除航班信息
    async removeRouteById(id) {
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

      const { data: res } = await this.$http.post('/mg/deleteRoute', {
        id: id
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllRouteList()
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