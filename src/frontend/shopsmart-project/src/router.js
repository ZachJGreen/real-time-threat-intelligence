import { createMemoryHistory, createRouter } from 'vue-router';

import WelcomeView from './components/TheWelcome.vue'
import DashboardView from './components/Dashboard.vue'

const routes = [
    { path: '/', component: WelcomeView },
    { path: '/dashboard', component: DashboardView},
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router;
