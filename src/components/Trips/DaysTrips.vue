<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>行程管理</el-breadcrumb-item>
      <el-breadcrumb-item>行程列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入行程名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllTripList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllTripList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getAllGroupList">添加行程</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="allDaysTripsList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand" v-for="(item, index) in props.row.routeList" :key="index">
              <el-form-item label="">
                <span>{{ item.date  + ' ' + item.time }}</span>
              </el-form-item>
              <el-form-item label="">
                <span class="routeTitleSpan">{{ item.desc }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="日期" prop="tripDate"></el-table-column>
        <el-table-column label="标题" prop="title"></el-table-column>
        <el-table-column label="描述" prop="desc"></el-table-column>
        <el-table-column label="早餐" prop="breakfast"></el-table-column>
        <el-table-column label="午餐" prop="lunch"></el-table-column>
        <el-table-column label="晚餐" prop="dinner"></el-table-column>
        <el-table-column label="日程描述图片" prop="daysPic"></el-table-column>
        <el-table-column label="所属团队" prop="tripName"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showDaysTripEditDialog(scope.row.dayId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeDaysTripById(scope.row.dayId)"
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

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDaysTripDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addFrom.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="addFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="早餐" prop="breakfast">
          <el-input v-model="addFrom.breakfast"></el-input>
        </el-form-item>
        <el-form-item label="午餐" prop="lunch">
          <el-input v-model="addFrom.lunch"></el-input>
        </el-form-item>
        <el-form-item label="晚餐" prop="dinner">
          <el-input v-model="addFrom.dinner"></el-input>
        </el-form-item>
        <el-form-item label="日程描述图片" prop="daysPic">
          <el-input v-model="addFrom.daysPic"></el-input>
        </el-form-item>
        <el-form-item label="日期" prop="tripDate">
          <el-input v-model="addFrom.tripDate"></el-input>
        </el-form-item>
        <el-form-item label="所属行程">
          <template>
            <el-select v-model="selectGroupId" placeholder="请选择">
              <el-option
                v-for="item in groupTripList"
                :key="item.tripId"
                :label="item.tripDesc"
                :value="item.tripId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="每日行程ID" prop="dayId">
          <el-input v-model="addFrom.dayId"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDaysTripDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDaysTrip">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改行程列表"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editFrom.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="editFrom.desc"></el-input>
        </el-form-item>
        <el-form-item label="早餐" prop="breakfast">
          <el-input v-model="editFrom.breakfast"></el-input>
        </el-form-item>
        <el-form-item label="午餐" prop="lunch">
          <el-input v-model="editFrom.lunch"></el-input>
        </el-form-item>
        <el-form-item label="晚餐" prop="dinner">
          <el-input v-model="editFrom.dinner"></el-input>
        </el-form-item>
        <el-form-item label="日程描述图片" prop="daysPic">
          <el-input v-model="editFrom.daysPic"></el-input>
        </el-form-item>
        <el-form-item label="日期" prop="tripDate">
          <el-input v-model="editFrom.tripDate"></el-input>
        </el-form-item>
        <el-form-item label="所属行程">
          <template>
            <el-select v-model="selectGroupId" placeholder="请选择">
              <el-option
                v-for="item in groupTripList"
                :key="item.tripId"
                :label="item.tripDesc"
                :value="item.tripId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="每日行程ID" prop="dayId">
          <el-input v-model="editFrom.dayId"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDaysTripInfo">确 定</el-button>
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
      //获取用户列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      // 获取团队列表
      groupTripList: [],
      selectGroupId: '',

      allDaysTripsList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addDaysTripDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {},
      //添加表单规则
      fromRules: {
        title: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        dayId: [
          {
            required: true,
            message: '请输入行程ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '航空ID长度在1-6之间'
          }
        ],
        desc: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        tripDate: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          },
          {
            validator: checkDate,
            trigger: 'blur'
          }
        ],
        lunch: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        breakfast: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        dinner: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        daysPic: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        selectGroupId: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ]
      },
      //查询到的行程信息保存
      editFrom: {}
    }
  },
  created() {
    this.getAllTripList()
  },
  watch: {
    selectGroupId(val) {
      this.value = this.demo
      this.addFrom.tripId = val
      this.editFrom.tripId = val
      console.log(this.addFrom)
    }
  },
  methods: {
    async getAllGroupList() {
      const { data: res } = await this.$http.get('/mg/getAllGroupTripMini')
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.groupTripList = res.data

      console.log(res)
      this.addDaysTripDialogVisible = true
    },
    async getAllTripList() {
      const { data: res } = await this.$http.get('/mg/getAllDaysTrip', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allDaysTripsList = res.data.list
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
      this.getAllTripList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllTripList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加每日行程
    addDaysTrip() {
      this.addFrom
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/addDaysTrip',
          this.addFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }

        this.addDaysTripDialogVisible = false
        this.getAllTripList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示用户编辑的对话框
    async showDaysTripEditDialog(dayId) {
      const { data: res } = await this.$http.get('/mg/getDayTrip', {
        params: { dayId: dayId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      console.log(res)

      const { data: res1 } = await this.$http.get('/mg/getAllGroupTripMini')
      if (res1.errno != '0') {
        return this.$message.error(res1.errmsg)
      }
      this.groupTripList = res1.data

      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.dayId = res.data.dayId + ''
      this.selectGroupId = res.data.tripId
      console.log(res)
      console.log(res1)
      this.$message.success(res.errmsg)
    },
    // 监听修改用户对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑每日信息
    editDaysTripInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/editDayTrip',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllTripList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除行程信息
    async removeDaysTripById(dayId) {
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

      const { data: res } = await this.$http.post('/mg/deleteDayTrip', {
        dayId: dayId
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllTripList()
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
  width: 30%;
}
.routeTitleSpan {
  font-weight: bold;
}
</style>