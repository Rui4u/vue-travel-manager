import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import './assets/css/global.css'
import './assets/fonts/iconfont.css'

import axios from 'axios'

// axios.defaults.baseURL = 'http://127.0.0.1:5000/api/v1.0/'
axios.defaults.baseURL = 'http://129.226.133.222:70/api/v1.0/'
    //axios设置请求拦截器
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
}, err => {
    console.log(err)
})


Vue.prototype.$http = axios


Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')