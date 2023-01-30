import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import './assets/custom.css'
import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'
import router from '.'
import * as fontawesome from './utils/fontawesome'

// ICONS
fontawesome.importIcons('plus', 'arrowLeft', 'arrowRight', 'cloudUpload', 'download', 'infoCircle', 'check', 'triangleExclamation', 'circleExclamation')

// APP
const app = createApp(App)
app.use(router)
app.use(FloatingVue)
app.component('icon', FontAwesomeIcon)
app.mount('#app')