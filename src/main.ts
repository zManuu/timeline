import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'
import router from '.'

const app = createApp(App)

app.use(router)
app.use(FloatingVue)
app.component('icon', FontAwesomeIcon)

app.mount('#app')