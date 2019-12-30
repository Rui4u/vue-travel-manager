<template>
<div class="login_contarner">
  <div class="login_box">
    <!-- 头像 -->
    <div class="avater_box">
      <img src="../assets/logo.png" alt="">
    </div>
    <!-- 登录表单 -->
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginFromRules" label-width="0px" class="login_form">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
      </el-form-item>
      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '沙师',
        password: '13552770003'
      },
      loginFromRules: {
        // 验证用户名是否合法
        username: [{
          required: true,
          message: '请输入登录名称',
          trigger: 'blur'
        }, ],
        // 验证密码是否合法
        password: [{
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          },
          {
            min: 10,
            max: 12,
            message: '长度在 10 到 12 个字符',
            trigger: 'blur'
          },
        ],
      }
    }
  },
  methods: {
    // 重置
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      //预验证
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;

        const {
          data: res
        } = await this.$http.post('managerLoginIn', this.loginForm)
        if (res.errno != '0') {
          return this.$message.error(res.errmsg)
        }

        this.$message.success(res.errmsg)
        window.sessionStorage.setItem("token", res.data.userId)
        this.$router.push('/home')
      });
    }
  }
}
</script>

<style lang="less" scoped>
.login_contarner {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #ffffff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avater_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;

    img {
      widows: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  width: 100%;
  bottom: 0px;
  padding: 0 10px;
  box-sizing: border-box;

}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
