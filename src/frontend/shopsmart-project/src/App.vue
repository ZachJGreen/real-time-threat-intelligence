<script setup>
import Banner from './components/Banner.vue'
import Home from './components/Home.vue'
</script>

<template>
  <div>
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue';

export default {
  components: {
    Dashboard
  }
};
</script>