<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>酒店管理</el-breadcrumb-item>
      <el-breadcrumb-item>酒店附近信息</el-breadcrumb-item>
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
              @clear="getAllHotelNearList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllHotelNearList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getAllHotelList">添加附近信息</el-button>
        </el-col>
      </el-row>
      <!-- 酒店列表区 -->
      <el-table :data="allHotelNearList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="名称" prop="siteName"></el-table-column>
        <el-table-column label="距离" prop="siteDistance"></el-table-column>
        <el-table-column label="花费时间" prop="siteTime"></el-table-column>
        <el-table-column label="所属酒店" prop="hotelName"></el-table-column>

        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showHotelEditDialog(scope.row)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removHotelNeartById(scope.row.id)"
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

    <!-- 添加酒店对话框 -->
    <el-dialog
      title="添加酒店附近信息"
      :visible.sync="addHotelNearDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="名称" prop="siteName">
          <el-input v-model="addFrom.siteName"></el-input>
        </el-form-item>
        <el-form-item label="距离" prop="siteDistance">
          <el-input v-model="addFrom.siteDistance"></el-input>
        </el-form-item>
        <el-form-item label="花费时间" prop="siteTime">
          <el-input v-model="addFrom.siteTime"></el-input>
        </el-form-item>
        <el-form-item label="所属酒店">
          <template>
            <el-select v-model="selectHotelId" placeholder="请选择">
              <el-option
                v-for="item in hotelList"
                :key="item.hotelId"
                :label="item.hotelName"
                :value="item.hotelId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHotelNearDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addHotelNear">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改酒店对话框 -->
    <el-dialog title="修改酒店" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="名称" prop="siteName">
          <el-input v-model="editFrom.siteName"></el-input>
        </el-form-item>
        <el-form-item label="距离" prop="siteDistance">
          <el-input v-model="editFrom.siteDistance"></el-input>
        </el-form-item>
        <el-form-item label="花费时间" prop="siteTime">
          <el-input v-model="editFrom.siteTime"></el-input>
        </el-form-item>
        <el-form-item label="所属酒店">
          <template>
            <el-select v-model="selectHotelId" placeholder="请选择">
              <el-option
                v-for="item in hotelList"
                :key="item.hotelId"
                :label="item.hotelName"
                :value="item.hotelId"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editHotelNearInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkNum = (rule, value, cb) => {
      const checkNum = /^\d+$|^\d+[.]?\d+$/
      if (checkNum.test(value) || value === '') {
        return cb()
      }
      cb(new Error('等级必须为数字'))
    }
    return {
      // 获取酒店信息
      hotelList: [],
      selectHotelId: '',
      //获取酒店列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      allHotelNearList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addHotelNearDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {
        siteName: '',
        siteTime: '',
        siteDistance: '',
        hotelId: ''
      },
      //添加和修改表单规则
      fromRules: {
        siteName: [
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
        siteTime: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        siteDistance: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
      },
      //查询到的航班信息保存
      editFrom: {}
    }
  },
  created() {
    this.getAllHotelNearList()
  },
  methods: {
    async getAllHotelNearList() {
      const { data: res } = await this.$http.get('/mg/getHotelNearSite', {
        params: this.quertInfo
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allHotelNearList = res.data.list
      if (res.data.currentPage < res.data.totalPage) {
        this.pageNum = res.data.currentPage + 1
      }
      this.totalPage = res.data.totalPage
      this.total = res.data.total
      console.log(res)
    },
    // 获取酒店信息
    async getAllHotelList() {
      const { data: res } = await this.$http.get('/mg/getAllHotelsMini')
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.hotelList = res.data
      console.log(res)
      this.addHotelNearDialogVisible = true
    },
    // 监听pagesize 改变
    handleSizeChange(newSize) {
      this.quertInfo.pageSize = newSize
      this.getAllHotelNearList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllHotelNearList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加酒店附近信息
    addHotelNear() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return
        this.addFrom.hotelId = this.selectHotelId
        console.log(this.addFrom)
        const { data: res } = await this.$http.post(
          '/mg/hotelnearsite',
          this.addFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addHotelNearDialogVisible = false
        this.getAllHotelNearList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示附近编辑的对话框
    async showHotelEditDialog(info) {
      const { data: res } = await this.$http.get('/mg/getAllHotelsMini')
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.hotelList = res.data
      
      this.editDialogVisible = true
      this.editFrom = info
      console.log(res)
      this.$message.success(res.errmsg)
    },
    // 监听修改酒店对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑酒店附近信息
    editHotelNearInfo() {
      this.editFrom.hotelId = this.selectHotelId
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/hotelNearEdit',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllHotelNearList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除附近信息
    async removHotelNeartById(id) {
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

      const { data: res } = await this.$http.post('/mg/hotelNearDelete', {
        id: id
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllHotelNearList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
</style>