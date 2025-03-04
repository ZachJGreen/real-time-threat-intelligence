import './assets/main.css'
import './assets/styles.css'

import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';

createApp(App).use(router, vuetify).mount('#app');
