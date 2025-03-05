

<template>
  <div class="container">
    <h1>Welcome to our</h1>
    <h2>ShopSmart Solutions</h2>
    
    <button @click="showDashboard = !showDashboard" class="dashboard-btn">
      Dashboard
    </button>

    <div v-if="showDashboard" class="dashboard-sections">
      <div class="box">
        <h3>Threat Logs</h3>
        <p>foo</p>
      </div>
      <div class="box">
        <h3>Risk Scores</h3>
        <p>bar</p>
      </div>
      <div class="box">
        <h3>Real-time Alerts</h3>
        <p>fizz</p>
      </div>
    </div>
  </div>
</template>



<script>
export default {
  data() {
    return {
      showDashboard: false, // Initially, dashboard sections are hidden
    };
  },
};
</script>

<style>
.container {
  text-align: center;
  font-family: Arial, sans-serif;
}

.dashboard-btn {
  margin: 20px;
  padding: 10px 20px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.dashboard-btn:hover {
  background-color: #0056b3;
}

.dashboard-sections {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.box {
  width: 200px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}
</style>

