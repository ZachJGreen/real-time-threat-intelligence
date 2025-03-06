import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import router from './router';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

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
  app.mount('#app')
