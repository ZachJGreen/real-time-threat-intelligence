<template>
    <div class="threat-dashboard">
      <h2>Threat Dashboard</h2>
      <div v-if="showDashboard" class="dashboard-sections">
        <div class="box">
          <h3>Threat Log</h3>
          <ul>
            <li v-for="(log, index) in threatLogs" :key="index">
              <strong>{{ log.threat_name }}</strong> on {{ log.asset_name }}
              <br />
              Vulnerability: {{ log.vulnerability_name }}
              <br />
              Likelihood: {{ log.likelihood }} | Impact: {{ log.impact }} | Risk Score: {{ log.risk_score }}
            </li>
          </ul>
        </div>
  
        <div class="box">
            <h3>Risk-score</h3>
            <ul>
                <li>Average Risk Score: {{ averageRiskScore }}</li>
            </ul>
        </div>
  
        <div class="box">
          <h3>Real-time Alert</h3>
          <ul>
            <li v-for="(alert, index) in realTimeAlerts" :key="index">{{ alert }}</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        showDashboard: false,
        threatLogs: [],
        averageRiskScore: 0, 
        realTimeAlerts: [], 
      };
    },

    methods: {
      toggleDashboard() {
        this.showDashboard = !this.showDashboard; 
      },
      async fetchData() {
        try {
            console.log('Fetching data from backend...');
            const response = await axios.get('http://localhost:3000/getThreatData');
            console.log('Data fetched:', response.data);
            this.threatLogs = response.data;

            const totalRiskScore = this.threatLogs.reduce((sum, log) => sum + log.risk_score, 0);
            this.averageRiskScore = (totalRiskScore / this.threatLogs.length).toFixed(2);

            this.realTimeAlerts = [
            "Unauthorized access detected on Server.",
            "Potential data breach in progress on MySQL.",
            "High CPU usage on Inventory Management System.",
            ];
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again later.');
        }
      },
    },
    mounted() {
      this.fetchData(); 
      this.showDashboard = true; 
    },
  };
  </script>
  
  <style>
.threat-dashboard {
  text-align: center;
  font-family: Arial, sans-serif;
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
  border: 2px solid #6c3434;
  border-radius: 8px;
  background-color: #b4b4b4;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  border-bottom: 2px solid #cebaba;
  padding-bottom: 5px;
  color: black;
}

ul {
  list-style-type: none;
  padding: 0;
  color: black;
}

li {
  padding: 5px;
  border-bottom: 1px solid #ddd;
  color: black;
}

.box ul {
  background-color: #f8f8f8; 
  padding: 10px;
  border-radius: 8px;
}
</style>