import { createMemoryHistory, createRouter } from 'vue-router';

import WelcomeView from './TheWelcome.vue'
import DashboardView from './Dashboard.vue'

const routes = [
    { path: '/', component: WelcomeView },
    { path: '/dashboard', component: DashboardView},
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router;
