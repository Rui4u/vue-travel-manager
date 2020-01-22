<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>行程管理</el-breadcrumb-item>
      <el-breadcrumb-item>航班列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入航班名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllFlightList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllFlightList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addFlightDialogVisible = true">添加航班</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="allFlightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="航空名称" prop="flightName"></el-table-column>
        <el-table-column label="出发口岸" prop="departureCity"></el-table-column>
        <el-table-column label="出发日期" prop="departureDate"></el-table-column>
        <el-table-column label="出发时间" prop="departureTime"></el-table-column>
        <el-table-column label="到达口岸" prop="arrivalCity"></el-table-column>
        <el-table-column label="到达日期" prop="arrivalDate"></el-table-column>
        <el-table-column label="到达时间" prop="arrivalTime"></el-table-column>
        <el-table-column label="飞行时间" prop="flightTime"></el-table-column>
        <el-table-column label="行李规定" prop="flightLuggageRules"></el-table-column>
        <el-table-column label="航班状态" prop="flightStatus"></el-table-column>
        <el-table-column label="航班类型" prop="flightType"></el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showFlightEditDialog(scope.row.flightId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeFlightById(scope.row.flightId)"
            ></el-button>
            <el-tooltip effect="dark" content="查看用户" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-user"
                size="mini"
                @click="checkFlightAllUser(scope.row)"
              ></el-button>
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
      :visible.sync="addFlightDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="航空名称" prop="flightName">
          <el-input v-model="addFrom.flightName"></el-input>
        </el-form-item>
        <el-form-item label="航空ID" prop="flightId">
          <el-input v-model="addFrom.flightId"></el-input>
        </el-form-item>
        <el-form-item label="出发口岸" prop="departureCity">
          <el-input v-model="addFrom.departureCity"></el-input>
        </el-form-item>
        <el-form-item label="出发日期" prop="departureDate">
          <el-input v-model="addFrom.departureDate"></el-input>
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-input v-model="addFrom.departureTime"></el-input>
        </el-form-item>
        <el-form-item label="到达口岸" prop="arrivalCity">
          <el-input v-model="addFrom.arrivalCity"></el-input>
        </el-form-item>
        <el-form-item label="到达日期" prop="arrivalDate">
          <el-input v-model="addFrom.arrivalDate"></el-input>
        </el-form-item>
        <el-form-item label="到达时间" prop="arrivalTime">
          <el-input v-model="addFrom.arrivalTime"></el-input>
        </el-form-item>
        <el-form-item label="飞行时间" prop="flightTime">
          <el-input v-model="addFrom.flightTime"></el-input>
        </el-form-item>
        <el-form-item label="行李规定" prop="flightLuggageRules">
          <el-input v-model="addFrom.flightLuggageRules"></el-input>
        </el-form-item>
        <el-form-item label="航班状态" prop="flightStatus">
          <el-input v-model="addFrom.flightStatus"></el-input>
        </el-form-item>
        <el-form-item label="航班类型" prop="flightType">
          <el-input v-model="addFrom.flightType"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFlightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFlight">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="航空名称" prop="flightName">
          <el-input v-model="editFrom.flightName"></el-input>
        </el-form-item>
        <el-form-item label="航空ID" prop="flightId">
          <el-input v-model="editFrom.flightId" disabled></el-input>
        </el-form-item>
        <el-form-item label="出发口岸" prop="departureCity">
          <el-input v-model="editFrom.departureCity"></el-input>
        </el-form-item>
        <el-form-item label="出发日期" prop="departureDate">
          <el-input v-model="editFrom.departureDate"></el-input>
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-input v-model="editFrom.departureTime"></el-input>
        </el-form-item>
        <el-form-item label="到达口岸" prop="arrivalCity">
          <el-input v-model="editFrom.arrivalCity"></el-input>
        </el-form-item>
        <el-form-item label="到达日期" prop="arrivalDate">
          <el-input v-model="editFrom.arrivalDate"></el-input>
        </el-form-item>
        <el-form-item label="到达时间" prop="arrivalTime">
          <el-input v-model="editFrom.arrivalTime"></el-input>
        </el-form-item>
        <el-form-item label="飞行时间" prop="flightTime">
          <el-input v-model="editFrom.flightTime"></el-input>
        </el-form-item>
        <el-form-item label="行李规定" prop="flightLuggageRules">
          <el-input v-model="editFrom.flightLuggageRules"></el-input>
        </el-form-item>
        <el-form-item label="航班状态" prop="flightStatus">
          <el-input v-model="editFrom.flightStatus"></el-input>
        </el-form-item>
        <el-form-item label="航班类型" prop="flightType">
          <el-input v-model="editFrom.flightType"></el-input>
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
      allFlightsList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addFlightDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {},
      //添加表单规则
      addFromRules: {
        flightName: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightId: [
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
        ],
        arrivalCity: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        arrivalDate: [
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
        arrivalTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        departureCity: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        departureDate: [
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
        departureTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightLuggageRules: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightStatus: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],

        flightType: [
          {
            required: true,
            message: '请输入日期',
            trigger: 'blur'
          }
        ]
      },
      //查询到的航班信息保存
      editFrom: {},
      //编辑表单规则
      editFromRules: {
        flightName: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightId: [
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
        ],
        arrivalCity: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        arrivalDate: [
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
        arrivalTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        departureCity: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        departureDate: [
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
        departureTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightLuggageRules: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightStatus: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        flightTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],

        flightType: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getAllFlightList()
  },
  methods: {
    // 查看航班人员
    checkFlightAllUser(flightInfo) {
      this.$router.push({
        path: '/flightUser',
        query: {
          flightId: flightInfo.flightId,
          flightName: flightInfo.flightName
        }
      })
    },
    async getAllFlightList() {
      const { data: res } = await this.$http.get('/mg/getAllFlights', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allFlightsList = res.data.list
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
      this.getAllFlightList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllFlightList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加航班
    addFlight() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('/mg/flights', this.addFrom)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addFlightDialogVisible = false
        this.getAllFlightList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示用户编辑的对话框
    async showFlightEditDialog(flightId) {
      const { data: res } = await this.$http.get('/mg/getFlight', {
        params: { flightId: flightId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.flightId = res.data.flightId + ''
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
          '/mg/flightEdit',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllFlightList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除航班信息
    async removeFlightById(flightId) {
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

      const { data: res } = await this.$http.post('/mg/flightDelete', {
        flightId: flightId
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllFlightList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
</style>