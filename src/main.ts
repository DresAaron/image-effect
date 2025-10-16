import './assets/main.css'
import { createApp } from 'vue'

import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPanorama, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

library.add(faPanorama, faWandMagicSparkles)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
