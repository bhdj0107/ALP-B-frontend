import './assets/main.css'
import axios from 'axios'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// axios 기본 설정
axios.defaults.baseURL = 'http://localhost:8080/api/v1'

app.use(pinia)
app.use(router)
app.mount('#app')
