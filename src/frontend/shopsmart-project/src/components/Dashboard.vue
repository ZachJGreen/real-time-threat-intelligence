<template>
  <div class="container">
    <h1>Welcome to our</h1>
    <h2>ShopSmart Solutions</h2>
    

    <!--Toogle Button -->
    <button @click="showDashboard = !showDashboard" class="dashboard-btn">
      {{  showdashboard ? "Hide Dashboard" : "Show Dashboard "}}
    </button>

    <!--Dashboard Sections -->
    <div v-if="showDashboard" class="dashboard-sections">
    </div>
      <div class="box">
        <h3>Threat Log</h3>
        <ul>
          <li v-for="(log, index) in threatLogs" :key="index">{{ log }}</li>
        </ul>
      </div>


      <div class="box">
        <h3>Risk-score</h3>
        <ul>
          <li v-for="(score, index) in riskScores" :key="index">{{ score }}</li>
        </ul>
      </div>
      
      <div class="box">
        <h3>Real-time Alert</h3>
        <ul>
          <li v-for="(alert, index) in realTimeAlerts" :key="index">{{ alert }}</li>
        </ul>
      </div>
    </div>
  

</template>



<script>
export default {
  data() {
    return {
      showDashboard: false, //Initial State: Dashboard is hidden
      threatLogs: ["Log 1", "Log 2", "Log 3"],
      riskScores: ["Score A", "Score B", "Score C"],
      realTimeAlerts: ["Alert X", "Alert Y", "Alert Z"]
    };
  },
  methods: {
  toogleDashboard() {
    this.showDashboard= !this.showDashboard;
   }
  }
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
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #ddd;
}
</style>