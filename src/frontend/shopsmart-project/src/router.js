import { createMemoryHistory, createRouter } from 'vue-router';

import Home from './components/Home.vue'
import DashboardView from './components/Dashboard.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/dashboard', component: DashboardView},
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router;
