<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>酒店管理管理</el-breadcrumb-item>
      <el-breadcrumb-item>酒店列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入酒店名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllHotelList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllHotelList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addHotelDialogVisible = true">添加酒店</el-button>
        </el-col>
      </el-row>
      <!-- 酒店列表区 -->
      <el-table :data="allHotelList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="酒店ID" prop="hotelId"></el-table-column>
        <el-table-column label="酒店名称" prop="hotelName"></el-table-column>
        <el-table-column label="英文名称" prop="engName"></el-table-column>
        <el-table-column label="酒店星级" prop="starLevel"></el-table-column>
        <el-table-column label="酒店描述" prop="desc"></el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showHotelEditDialog(scope.row.hotelId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeFlightById(scope.row.hotelId)"
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

    <!-- 添加酒店对话框 -->
    <el-dialog
      title="添加酒店"
      :visible.sync="addHotelDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="酒店ID" prop="hotelId">
          <el-input v-model="addFrom.hotelId"></el-input>
        </el-form-item>
        <el-form-item label="酒店名称" prop="hotelName">
          <el-input v-model="addFrom.hotelName"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="engName">
          <el-input v-model="addFrom.engName"></el-input>
        </el-form-item>
        <el-form-item label="酒店星级" prop="starLevel">
          <el-input v-model="addFrom.starLevel"></el-input>
        </el-form-item>
        <el-form-item label="酒店描述" prop="desc">
          <el-input v-model="addFrom.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHotelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addHotel">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改酒店对话框 -->
    <el-dialog title="修改酒店" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="酒店ID" prop="hotelId">
          <el-input v-model="editFrom.hotelId" disabled></el-input>
        </el-form-item>
        <el-form-item label="酒店名称" prop="hotelName">
          <el-input v-model="editFrom.hotelName"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="engName">
          <el-input v-model="editFrom.engName"></el-input>
        </el-form-item>
        <el-form-item label="酒店星级" prop="starLevel">
          <el-input v-model="editFrom.starLevel"></el-input>
        </el-form-item>
        <el-form-item label="酒店描述" prop="desc">
          <el-input v-model="editFrom.desc"></el-input>
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
    var checkNum = (rule, value, cb) => {
      const checkNum = /^\d+$|^\d+[.]?\d+$/;
      if (checkNum.test(value) || value === '') {
        return cb()
      }
      cb(new Error('等级必须为数字'))
    }
    return {
      //获取酒店列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      allHotelList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addHotelDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {
        hotelId:'',
        hotelName: '',
        engName: '',
        starLevel: 0,
        desc: '',
      },
      //添加和修改表单规则
      fromRules: {
        hotelName: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        hotelId: [
          {
            required: true,
            message: '请输入航班ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '酒店ID长度在1-6之间'
          }
        ],
        engName: [
          {
            required: false,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        desc: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        starLevel:  [
          {
            required: false,
            message: '未输入',
            trigger: 'blur'
          },
          {
            validator: checkNum,
            trigger: 'blur'
          }
        ]
      },
      //查询到的航班信息保存
      editFrom: {},
    }
  },
  created() {
    this.getAllHotelList()
  },
  methods: {
    async getAllHotelList() {
      const { data: res } = await this.$http.get('/mg/getAllHotels', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allHotelList = res.data.list
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
      this.getAllHotelList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllHotelList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加航班
    addHotel() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('/mg/addHotel', this.addFrom)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addHotelDialogVisible = false
        this.getAllHotelList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示酒店编辑的对话框
    async showHotelEditDialog(hotelId) {
      const { data: res } = await this.$http.get('/mg/getHotel', {
        params: { hotelId: hotelId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.hotelId = res.data.hotelId + ''
      console.log(res)
      this.$message.success(res.errmsg)
    },
    // 监听修改酒店对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑酒店
    editFlightInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/hotelEdit',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllHotelList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除航班信息
    async removeFlightById(hotelId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该酒店, 是否继续?',
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

      const { data: res } = await this.$http.post('/mg/hotelDelete', {
        hotelId: hotelId
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllHotelList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
</style>