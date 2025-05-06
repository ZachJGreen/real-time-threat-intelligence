<script setup>
import Banner from './components/Banner.vue'
import Home from './components/Home.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <Banner msg="Welcome to our" />
    </div>
  
  </header>

  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/dashboard">Dashboard</RouterLink>
    <RouterLink to="/mitigation">Threat Mitigation</RouterLink>
  </nav>

  <main>
    <RouterView/>
  </main>

</template>

<script>
import Dashboard from './components/Dashboard.vue';

export default {
  components: {
    Dashboard
  }
};
</script>