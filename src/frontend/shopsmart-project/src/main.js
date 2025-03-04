import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';

createApp(App).use(router, vuetify).mount('#app');
