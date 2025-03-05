
<template>
    <div class="card">
    <h2>Threat Logs</h2>
    <ul>
        <li v-for="log in logs" :key="log.id">{{  log }}</li>
        </ul>
   </div>
</template>

<script setup>
import { ref } from 'vue':
const logs = ref ([
    { id: 1, message: 'Suspicious login detected' },
    { id: 2, message: 'Multiple failed login attempts' }

]);
</script>

<style scoped>
.card { padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
</style>
