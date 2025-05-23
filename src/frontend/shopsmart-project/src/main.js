import './assets/main.css'
import './assets/styles.css'

import { createApp } from 'vue';
import App from './App.vue';
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import router from './router';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { threatData } from './utils/risk_prioritization';  
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'dark',
    }
  })
  
  const app = createApp(App)
  app.use(router)
  app.use(vuetify)
  app.use(Toast)
  app.mount('#app')
  console.log(threatData);
