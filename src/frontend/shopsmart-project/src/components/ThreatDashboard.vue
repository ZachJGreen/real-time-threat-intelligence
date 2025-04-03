<template>
    <div class="threat-dashboard">
      <h2>Threat Dashboard</h2>
      <div v-if="showDashboard" class="dashboard-sections">

        <!--threat log section-->
        <div class="box">
          <h3 class="text-xl font-semibold">Threat Log</h3>
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
  
        <!--threat prioritization table-->
        <table class="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr class="bg-gray-200">
              <th class="py-2 px-4 border">Threat Name</th>
              <th class="py-2 px-4 border">Likelihood</th>
              <th class="py-2 px-4 border">Impact</th>
              <th class="py-2 px-4 border">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(threat, index) in threats" :key="index" class="text-center border">
              <td class="py-2 px-4">{{ threat.name }}</td>
              <td class="py-2 px-4">{{ threat.likelihood }}</td>
              <td class="py-2 px-4">{{ threat.impact }}</td>
              <td class="py-2 px-4 font-bold text-red-500">{{ threat.risk_score }}</td>
            </tr>
          </tbody>
        </table>

        <!--average risk score-->
        <div class="box">
            <h3>Risk-score</h3>
            <ul>
                <li>Average Risk Score: {{ averageRiskScore }}</li>
            </ul>
        </div>
  
        <!--real-time alert section-->
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
  import { threatData, threatLogData } from "../utils/risk_prioritization";
  
  export default {
    data() {
      return {
        showDashboard: false,
        threatLogs: [],
        averageRiskScore: 0, 
        realTimeAlerts: [], 
        threats: JSON.parse(threatData), // data for prioritized threats
        threatLogs: JSON.parse(threatLogData), // data for the threat log
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

            // calculate risk score
            const totalRiskScore = this.threatLogs.reduce((sum, log) => sum + log.risk_score, 0);
            this.averageRiskScore = (totalRiskScore / this.threatLogs.length).toFixed(2);

            // example real time alert
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
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  margin-top: 25px;
}

.box {
  width: 100%; /* Default to full width */
  padding: 15px;
  border: 2px solid #6c3434;
  border-radius: 8px;
  background-color: #b4b4b4;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Responsive layout */
@media (min-width: 768px) {
  .box {
    width: calc(50% - 20px); /* Two boxes per row */
  }
}

@media (min-width: 1024px) {
  .box {
    width: calc(33.33% - 20px); /* Three boxes per row on larger screens */
  }
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

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f9f9f9;
}

.font-bold {
  font-weight: bold;
}

.text-red-500 {
  color: red;
}
</style>