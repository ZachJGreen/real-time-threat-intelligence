<template>
  <div class="container">
    <h1>Main Dashboard</h1>

    <!--Toogle Button -->
    <button @click="showDashboard = !showDashboard" class="dashboard-btn">
      {{  showdashboard ? "Hide Dashboard" : "Show Dashboard "}}
    </button>
    
    <!-- Conditionally render the ThreatDashboard based on showDashboard -->
    <ThreatDashboard v-if="showDashboard" />
  </div>
</template>



<script>
import ThreatDashboard from './ThreatDashboard.vue';
export default {
  name: "Dashboard",
  components: {
    ThreatDashboard,
  },

  data() {
    return {
      showDashboard: false,
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
  gap: 25px;
  margin-top: 25px;

}

.box {
  width: 250px;
  padding: 15px;
  border: 2px solid #2f1414;
  border-radius: 8px;
  background-color: #8e8e8e;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  border-bottom: 2px solid #000000;
  padding-bottom: 5px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #7f5858;
}
</style>