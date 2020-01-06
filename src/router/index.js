import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welecome from '../components/Welecome.vue'
import Users from '../components/Users/Users.vue'
import Leaders from '../components/Users/Leaders.vue'
import Managers from '../components/Users/Managers.vue'
import Flights from '../components/Trips/Flights.vue'
import Trips from '../components/Trips/Trips.vue'
import Hotels from '../components/Hotels/Hotels.vue'
import HotelNear from '../components/Hotels/HotelNear.vue'

Vue.use(VueRouter)



const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welecome',
        children: [{
            path: '/welecome',
            component: Welecome
        }, {
            path: '/users',
            component: Users
        }, {
            path: '/leaders',
            component: Leaders
        }, {
            path: '/managers',
            component: Managers
        }, {
            path: '/flights',
            component: Flights
        }, {
            path: '/trips',
            component: Trips
        }, {
            path: '/hotels',
            component: Hotels
        }, {
            path: '/hotelNear',
            component: HotelNear
        }, ]
    }

]

const router = new VueRouter({
    routes
})

//  路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
        // 获取token
    const token = window.sessionStorage.getItem('token')
    if (!token) return next('/login')
    next()

})

export default router