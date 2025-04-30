import {createApp} from 'vue'
import './style.css'
import 'virtual:svg-icons-register'

import App from './App.vue'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
app.use(Antd)
app.mount('#app')

