<template>
  <div class="threat-dashboard">
    <h2>Threat Intelligence Dashboard</h2>
    
    <!-- Error message display -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      Loading threat data...
    </div>
    
    <!-- Add tabs for different dashboard views -->
    <div class="dashboard-tabs">
      <button 
        @click="activeTab = 'overview'" 
        :class="{ active: activeTab === 'overview' }"
      >
        Overview
      </button>
      <button 
        @click="activeTab = 'threats'" 
        :class="{ active: activeTab === 'threats' }"
      >
        Threat Log
      </button>
      <button 
        @click="activeTab = 'analysis'" 
        :class="{ active: activeTab === 'analysis' }"
      >
        Risk Analysis
      </button>
      <button 
        @click="activeTab = 'alerts'" 
        :class="{ active: activeTab === 'alerts' }"
      >
        Alerts
        <span v-if="alerts.length > 0" class="alert-badge">{{ alerts.length }}</span>
      </button>
    </div>
  </div>
    
    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="dashboard-content">
      <div class="dashboard-cards">
        <div class="card">
          <h3>Risk Summary</h3>
          <div class="stat">
            <span class="stat-value">{{ highRiskCount }}</span>
            <span class="stat-label">High Risk Threats</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ averageRiskScore }}</span>
            <span class="stat-label">Avg. Risk Score</span>
          </div>
        </div>
        
        <div class="card">
          <h3>Asset Exposure</h3>
          <div class="stat">
            <span class="stat-value">{{ affectedAssets }}</span>
            <span class="stat-label">Affected Assets</span>
          </div>
          <div class="progress-bar">
            <div class="progress" :style="{ width: protectionRate + '%' }"></div>
          </div>
          <div class="stat-label">{{ protectionRate }}% Protected</div>
        </div>
        
        <div class="card">
          <h3>Recent Activity</h3>
          <ul class="activity-list">
            <li v-for="(activity, index) in recentActivities" :key="index">
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
              <span class="activity-text">{{ activity.text }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Top Threats Table -->
      <div class="card full-width">
        <h3>Top Threats by Risk Score</h3>
        <table class="threats-table">
          <thead>
            <tr>
              <th>Threat</th>
              <th>Asset</th>
              <th>Likelihood</th>
              <th>Impact</th>
              <th>Risk Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="threat in topThreats" :key="threat.id">
              <td>{{ threat.threat_name }}</td>
              <td>{{ threat.asset_name }}</td>
              <td>{{ threat.likelihood }}</td>
              <td>{{ threat.impact }}</td>
              <td class="risk-score" :class="getRiskClass(threat.risk_score)">
                {{ threat.risk_score }}
              </td>
              <td>
                <button @click="analyzeRisk(threat)" class="action-btn">Analyze</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Threat Log Tab -->
    <div v-if="activeTab === 'threats'" class="dashboard-content">
      <div class="card full-width">
        <h3>Threat Intelligence Log</h3>
        <div class="filter-controls">
          <input 
            type="text" 
            v-model="threatFilter" 
            placeholder="Filter threats..." 
            class="filter-input"
          />
          <select v-model="assetFilter" class="filter-select">
            <option value="">All Assets</option>
            <option v-for="asset in uniqueAssets" :key="asset">{{ asset }}</option>
          </select>
          <download-csv
            :data="filteredThreatLogs"
            :fields="csvFields"
            name="ShopSmart_Threat_Intelligence_Report.csv"
            class="threat-download-csv"
          >
            <v-btn color="info" dark tile elevation="0">
              Generate CSV Report
            </v-btn>
          </download-csv>
        </div>
        
        <div class="table-container">
          <table class="threats-table">
            <thead>
              <tr>
                <th>Threat</th>
                <th>Asset</th>
                <th>Vulnerability</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredThreatLogs" :key="log.id">
                <td>{{ log.threat_name }}</td>
                <td>{{ log.asset_name }}</td>
                <td>{{ log.vulnerability_name }}</td>
                <td>{{ log.likelihood }}</td>
                <td>{{ log.impact }}</td>
                <td class="risk-score" :class="getRiskClass(log.risk_score)">
                  {{ log.risk_score }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Risk Analysis Tab -->
    <div v-if="activeTab === 'analysis'" class="dashboard-content">
      <CostBenefitAnalysis :threats="threatLogs" />
    </div>
    
    <!-- Alerts Tab -->
    <div v-if="activeTab === 'alerts'" class="dashboard-content">
      <div class="card full-width">
        <div class="card-header">
          <h3>Active Alerts</h3>
          <button @click="showCreateAlertDialog = true" class="create-btn">
            Create Test Alert
          </button>
        </div>
        
        <div class="alerts-container">
          <div v-if="alerts.length === 0" class="no-alerts">
            No active alerts at this time.
          </div>
          <div v-for="alert in alerts" :key="alert.id" class="alert-card" :class="getAlertClass(alert)">
            <div class="alert-header">
              <span class="alert-type">{{ alert.alert_type }}</span>
              <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
            </div>
            <div class="alert-body">
              <h4>{{ alert.threat_name || alert.threats?.threat_name || 'Unnamed Threat' }}</h4>
              <p>{{ alert.description }}</p>
              <div class="alert-score">
                Risk Score: <span :class="getRiskClass(alert.risk_score)">{{ alert.risk_score }}</span>
              </div>
            </div>
            <div class="alert-actions">
              <button @click="acknowledgeAlert(alert)" v-if="alert.status === 'Open'" class="action-btn">
                Acknowledge
              </button>
              <button @click="resolveAlert(alert)" v-if="alert.status !== 'Resolved'" class="action-btn resolve">
                Resolve
              </button>
            </div>
          </div>
        </div>
        <!-- Add alert creation dialog -->
        <div v-if="showCreateAlertDialog" class="alert-dialog">
          <div class="dialog-content">
            <h4>Create Test Alert</h4>
            <div class="form-group">
              <label for="alertName">Threat Name:</label>
              <input id="alertName" v-model="newAlert.name" type="text" class="form-control">
            </div>
            <div class="form-group">
              <label for="alertRisk">Risk Score (1-25):</label>
              <input id="alertRisk" v-model.number="newAlert.riskScore" type="number" min="1" max="25" class="form-control">
            </div>
            <div class="form-group">
              <label for="alertDesc">Description:</label>
              <textarea id="alertDesc" v-model="newAlert.description" class="form-control"></textarea>
            </div>
            <div class="dialog-actions">
              <button @click="createTestAlert" class="action-btn">Create</button>
              <button @click="showCreateAlertDialog = false" class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import axios from 'axios';
import CostBenefitAnalysis from './CostBenefitAnalysis.vue';
import { threatData, threatLogData } from "../utils/risk_prioritization";
import JsonCSV from 'vue-json-csv';
import { useToast } from 'vue-toastification';
import { getCSVFields, prepareCSVData } from '../utils/csv-utils';

export default {
  components: {
    downloadCsv: JsonCSV,
    CostBenefitAnalysis
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      activeTab: 'overview',
      showDashboard: true,
      averageRiskScore: 0,
      threatLogs: [],
      threats: JSON.parse(threatData),
      alerts: [],
      threatFilter: '',
      assetFilter: '',
      loading: false,
      errorMessage: null,
      showCreateAlertDialog: false,
      newAlert: {
        name: '',
        riskScore: 15,
        description: ''
      },
      recentActivities: [
        { time: new Date(Date.now() - 25 * 60000), text: 'New vulnerability detected: CVE-2023-1234' },
        { time: new Date(Date.now() - 55 * 60000), text: 'System scan completed' },
        { time: new Date(Date.now() - 125 * 60000), text: 'Alert: Suspicious login attempt' }
      ],
      csvFields: getCSVFields()
    };
  },
  computed: {
    highRiskCount() {
      return this.threatLogs.filter(threat => threat.risk_score >= 15).length;
    },
    affectedAssets() {
      return [...new Set(this.threatLogs.map(threat => threat.asset_name))].length;
    },
    protectionRate() {
      return Math.round((1 - this.highRiskCount / Math.max(this.threatLogs.length, 1)) * 100);
    },
    topThreats() {
      return [...this.threatLogs]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5);
    },
    uniqueAssets() {
      return [...new Set(this.threatLogs.map(log => log.asset_name))];
    },
    filteredThreatLogs() {
      return this.threatLogs.filter(log => {
        const matchesFilter = this.threatFilter === '' || 
          log.threat_name.toLowerCase().includes(this.threatFilter.toLowerCase()) ||
          log.vulnerability_name.toLowerCase().includes(this.threatFilter.toLowerCase());
          
        const matchesAsset = this.assetFilter === '' || log.asset_name === this.assetFilter;
        
        return matchesFilter && matchesAsset;
      });
    },
    csvData(){
      return prepareCSVData(this.filteredThreatLogs);
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.errorMessage = null;
      
      try {
        console.log('Fetching threat data...');
        const response = await axios.get('http://localhost:5001/api/getThreatData');
        this.threatLogs = response.data;
        
        const totalRiskScore = this.threatLogs.reduce((sum, log) => sum + log.risk_score, 0);
        this.averageRiskScore = (totalRiskScore / Math.max(this.threatLogs.length, 1)).toFixed(2);
        
        const alertsResponse = await axios.get('http://localhost:5001/api/getAllAlerts');
        this.alerts = alertsResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        this.errorMessage = "Failed to fetch threat data. Using sample data.";
        
        // Use sample data as fallback
        this.threatLogs = JSON.parse(threatLogData);
        const totalRiskScore = this.threatLogs.reduce((sum, log) => sum + log.risk_score, 0);
        this.averageRiskScore = (totalRiskScore / this.threatLogs.length).toFixed(2);
      } finally {
        this.loading = false;
      }
    },
    getRiskClass(score) {
      if (score >= 20) return 'critical';
      if (score >= 15) return 'high';
      if (score >= 10) return 'medium';
      return 'low';
    },
    getAlertClass(alert) {
      return {
        'critical-alert': alert.risk_score >= 20,
        'high-alert': alert.risk_score >= 15 && alert.risk_score < 20,
        'medium-alert': alert.risk_score >= 10 && alert.risk_score < 15,
        'acknowledged': alert.status === 'Acknowledged'
      };
    },
    formatTime(timestamp) {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    analyzeRisk(threat) {
      this.activeTab = 'analysis';
    },
    async acknowledgeAlert(alert) {
      try {
        await axios.post(`http://localhost:5001/api/updateAlertStatus`, {
          id: alert.id,
          status: 'Acknowledged'
        });
        alert.status = 'Acknowledged';
      } catch (error) {
        console.error('Error acknowledging alert:', error);
      }
    },
    async resolveAlert(alert) {
      try {
        await axios.post(`http://localhost:5001/api/updateAlertStatus`, {
          id: alert.id,
          status: 'Resolved'
        });
        alert.status = 'Resolved';
        // Remove from active alerts after a delay for UI feedback
        setTimeout(() => {
          this.alerts = this.alerts.filter(a => a.id !== alert.id);
        }, 1000);
      } catch (error) {
        console.error('Error resolving alert:', error);
      }
    },
    async createTestAlert() {
    if (!this.newAlert.name) {
      // Check if toast is available
      if (this.toast) {
        this.toast.error('Please enter a threat name');
      } else {
        alert('Please enter a threat name');
      }
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/createAlert', {
        threat_name: this.newAlert.name,
        risk_score: this.newAlert.riskScore,
        description: this.newAlert.description || `Test alert: ${this.newAlert.name}`
      });
      
      if (this.toast) {
        this.toast.success('Test alert created successfully');
      } else {
        alert('Test alert created successfully');
      }
      
      this.showCreateAlertDialog = false;
      
      // Clear form
      this.newAlert = {
        name: '',
        riskScore: 15,
        description: ''
      };
      
      // Refresh alerts
      this.fetchData();
    } catch (error) {
      console.error('Error creating test alert:', error);
      if (this.toast) {
        this.toast.error('Failed to create test alert');
      } else {
        alert('Failed to create test alert: ' + error.message);
      }
    }
    },
  },
  mounted() {
    this.fetchData();
    
    // Set up polling for real-time data updates (every 30 seconds)
    this.dataInterval = setInterval(() => {
      this.fetchData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
    }
  }

};
</script>

<style scoped>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1a1a2e; /* Deep navy for base text */
  line-height: 1.6;
}

.threat-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f4f8; /* Light blue-gray background */
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #991b1b;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #4a5568;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #1a365d; /* Dark blue */
  font-weight: 600;
}

.dashboard-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.dashboard-tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  position: relative;
  color: #2d3748; /* Dark gray */
  transition: color 0.3s ease;
}

.dashboard-tabs button:hover {
  color: #2c5282; /* Slightly lighter blue on hover */
}

.dashboard-tabs button.active {
  border-bottom: 3px solid #3182ce;
  color: #2c5282;
  font-weight: bold;
}

.alert-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-content {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  color: #2d3748; /* Dark gray for text */
}

.full-width {
  grid-column: 1 / -1;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c5282; /* Deep blue */
}

.stat-label {
  font-size: 14px;
  color: #4a5568; /* Slightly darker gray */
  margin-top: 5px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
}

.progress {
  height: 100%;
  background-color: #48bb78;
}

.activity-list {
  list-style-type: none;
  padding: 0;
}

.activity-list li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.activity-time {
  color: #718096;
  margin-right: 10px;
  min-width: 100px;
}

.activity-text {
  flex-grow: 1;
  text-align: right;
  color: #2d3748;
}

.threats-table {
  width: 100%;
  border-collapse: collapse;
}

.threats-table th, 
.threats-table td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
  color: #2d3748; /* Dark gray text */
}

.threats-table th {
  background-color: #f7fafc; /* Very light blue-gray */
  color: #1a365d; /* Dark blue */
  font-weight: 600;
}

.risk-score {
  font-weight: bold;
  text-align: center;
}

.risk-score.low {
  color: #48bb78;
}

.risk-score.medium {
  color: #ed8936;
}

.risk-score.high {
  color: #f56565;
}

.risk-score.critical {
  color: #e53e3e;
  font-weight: bold;
}

.action-btn {
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.action-btn:hover {
  background-color: #2c5282;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
}

.filter-input, 
.filter-select {
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  color: #2d3748;
}

.filter-input {
  flex-grow: 1;
  margin-right: 10px;
}

.alerts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.alert-card {
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 5px solid transparent;
}

.alert-card.critical-alert {
  border-left-color: #e53e3e;
}

.alert-card.high-alert {
  border-left-color: #f56565;
}

.alert-card.medium-alert {
  border-left-color: #ed8936;
}

.alert-card.acknowledged {
  opacity: 0.7;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.alert-type {
  font-weight: bold;
  text-transform: uppercase;
  color: #2d3748;
}

.alert-time {
  color: #718096;
}

.alert-body h4 {
  margin: 0 0 10px 0;
  color: #1a365d;
}

.alert-body p {
  color: #2d3748;
  margin-bottom: 10px;
}

.alert-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.action-btn.resolve {
  background-color: #48bb78;
}

.no-alerts {
  text-align: center;
  color: #718096;
  padding: 20px;
}

h3 {
  color: #2c5282; /* Deep blue for headings */
  margin-bottom: 15px;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

.threat-download-csv {
  margin-left: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.create-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.create-btn:hover {
  background-color: #45a049;
}

.alert-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .dashboard-tabs {
    flex-direction: column;
  }

  .dashboard-tabs button {
    margin-bottom: 10px;
    text-align: left;
  }

  .filter-controls {
    flex-direction: column;
    gap: 10px;
  }

  .filter-input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
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