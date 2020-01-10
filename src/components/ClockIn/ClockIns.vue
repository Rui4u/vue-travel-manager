<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>打卡管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入景点名称"
              class="input-with-select"
              v-model="quertInfo.query"
              clearable
              @clear="getAllClockInList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getAllClockInList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addClickInDialogVisible = true">添加活动</el-button>
        </el-col>
      </el-row>
      <!-- 景点列表区 -->
      <el-table :data="allClockInList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="景点ID" prop="attractionsId"></el-table-column>
        <el-table-column label="景点名称" prop="name"></el-table-column>
        <el-table-column label="景点描述" prop="desc"></el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showClockInEditDialog(scope.row.attractionsId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeClockInById(scope.row.attractionsId)"
            ></el-button>
            <el-tooltip effect="dark" content="查看用户" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-user"
                size="mini"
                @click="checkClockInAllUser(scope.row)"
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

    <!-- 添加景点对话框 -->
    <el-dialog
      title="添加景点"
      :visible.sync="addClickInDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题 -->

      <el-form :model="addFrom" :rules="fromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="活动ID" prop="attractionsId">
          <el-input v-model="addFrom.attractionsId"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="addFrom.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClickInDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addClockIn">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改景点对话框 -->
    <el-dialog title="修改景点" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editFrom" :rules="fromRules" ref="editFromRef" label-width="100px">
        <el-form-item label="景点ID" prop="attractionsId">
          <el-input v-model="editFrom.attractionsId" disabled></el-input>
        </el-form-item>
        <el-form-item label="景点名称" prop="name">
          <el-input v-model="editFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="景点描述" prop="desc">
          <el-input v-model="editFrom.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editClockInInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //获取景点列表参数
      quertInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      allClockInList: [],
      //总页数
      totalPage: 0,
      total: 0,
      // 添加对话框
      addClickInDialogVisible: false,
      // 修改对话框
      editDialogVisible: false,
      // 添加表单
      addFrom: {
        attractionsId: '',
        name: '',
        desc: ''
      },
      //添加和修改表单规则
      fromRules: {
        name: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ],
        attractionsId: [
          {
            required: true,
            message: '请输入景点ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '景点ID长度在1-6之间'
          }
        ],
        desc: [
          {
            required: true,
            message: '未输入',
            trigger: 'blur'
          }
        ]
      },
      //查询到的景点信息保存
      editFrom: {}
    }
  },
  created() {
    this.getAllClockInList()
  },
  methods: {
    checkClockInAllUser(ClockInInfo) {
      this.$router.push({
        path: '/ClockInUsers',
        query: {
          attractionsId: ClockInInfo.attractionsId,
          name: ClockInInfo.name
        }
      })
    },
    async getAllClockInList() {
      const { data: res } = await this.$http.get(
        '/mg/getAllClickInAttractions',
        {
          params: this.quertInfo
        }
      )
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.allClockInList = res.data.list
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
      this.getAllClockInList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.quertInfo.pageNum = newPage
      this.getAllClockInList()
    },
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    //  添加景点
    addClockIn() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/addClickInAttraction',
          this.addFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.addClickInDialogVisible = false
        this.getAllClockInList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 展示景点编辑的对话框
    async showClockInEditDialog(attractionsId) {
      const { data: res } = await this.$http.get('/mg/getClickInAttraction', {
        params: { attractionsId: attractionsId }
      })
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = true
      this.editFrom = res.data
      this.editFrom.attractionsId = res.data.attractionsId + ''
      console.log(res)
      this.$message.success(res.errmsg)
    },
    // 监听修改景点对话框关闭
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    //  编辑景点
    editClockInInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          '/mg/clockInAttractionsEdit',
          this.editFrom
        )
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }
        this.editDialogVisible = false
        this.getAllClockInList()
        console.log(res)
        this.$message.success(res.errmsg)
      })
    },
    // 根据id,删除景点信息
    async removeClockInById(attractionsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该景点, 是否继续?',
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

      const { data: res } = await this.$http.post(
        '/mg/clockInAttractionsDelete',
        {
          attractionsId: attractionsId
        }
      )
      if (res.errno != '0') {
        return this.$message.error(res.errmsg)
      }
      this.editDialogVisible = false
      this.getAllClockInList()
      console.log(res)
      this.$message.success(res.errmsg)
    }
  }
}
</script>
<style lang="less" scoped>
.ClockInNearInfoDiv {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;

  label:nth-child(1) {
    font-weight: bold;
    font-size: 14px;
  }
}
</style>