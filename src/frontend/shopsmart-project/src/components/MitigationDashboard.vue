<template>
    <div class="mitigation-dashboard">
      <h2>Automated Threat Mitigation</h2>
      
      <div class="dashboard-cards">
        <div class="card">
          <h3>Mitigation Summary</h3>
          <div class="stats">
            <div class="stat">
              <div class="stat-value">{{ mitigationStats.total }}</div>
              <div class="stat-label">Total Mitigations</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ mitigationStats.successful }}</div>
              <div class="stat-label">Successful</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ mitigationStats.failed }}</div>
              <div class="stat-label">Failed</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3>Effectiveness</h3>
          <div class="effectiveness-chart">
            <div v-for="(metric, type) in effectivenessMetrics" :key="type" class="metric">
              <div class="metric-label">{{ formatMetricLabel(type) }}</div>
              <div class="metric-bar">
                <div class="metric-fill" :style="{ width: `${metric.effectiveness * 100}%` }"></div>
              </div>
              <div class="metric-value">{{ (metric.effectiveness * 100).toFixed(0) }}%</div>
              <div class="metric-count">({{ metric.count }})</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card full-width">
        <div class="card-header">
          <h3>Recent Mitigations</h3>
          <button @click="showMitigateDialog = true" class="action-btn">
            Test Mitigation
          </button>
        </div>
        
        <div class="table-responsive">
          <table class="mitigation-table">
            <thead>
              <tr>
                <th>Threat Type</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Actions Taken</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mitigationHistory" :key="item.id" :class="getSeverityClass(item.severity)">
                <td>{{ item.threat_type }}</td>
                <td>{{ item.risk_score }}</td>
                <td>{{ capitalize(item.severity) }}</td>
                <td>{{ summarizeActions(item.actions_taken) }}</td>
                <td>{{ capitalize(item.status) }}</td>
                <td>{{ formatDate(item.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Test Mitigation Dialog -->
      <div v-if="showMitigateDialog" class="dialog">
        <div class="dialog-content">
          <h3>Test Threat Mitigation</h3>
          
          <div class="form-group">
            <label>Threat Type:</label>
            <select v-model="newMitigation.threatType" class="form-control">
              <option value="">Select a Threat Type</option>
              <option value="SQL Injection">SQL Injection</option>
              <option value="Cross-Site Scripting">Cross-Site Scripting</option>
              <option value="Phishing">Phishing</option>
              <option value="DDoS">DDoS Attack</option>
              <option value="Brute Force">Brute Force</option>
              <option value="Malware">Malware</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Risk Score (1-25):</label>
            <input 
              type="number" 
              v-model.number="newMitigation.riskScore" 
              min="1" 
              max="25" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>Source IP (optional):</label>
            <input 
              type="text" 
              v-model="newMitigation.ip" 
              placeholder="e.g. 192.168.1.1" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>Description:</label>
            <textarea 
              v-model="newMitigation.description" 
              class="form-control"
              placeholder="Enter description of the threat..."
            ></textarea>
          </div>
          
          <div class="dialog-actions">
            <button @click="testMitigation" class="action-btn">
              Start Mitigation
            </button>
            <button @click="showMitigateDialog = false" class="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useToast } from 'vue-toastification';
  
  export default {
    name: 'MitigationDashboard',
    
    setup() {
      const toast = useToast();
      return { toast };
    },
    
    data() {
      return {
        mitigationHistory: [],
        effectivenessMetrics: {},
        showMitigateDialog: false,
        loading: false,
        newMitigation: {
          threatType: '',
          riskScore: 15,
          ip: '',
          description: ''
        },
        mitigationStats: {
          total: 0,
          successful: 0,
          failed: 0
        }
      };
    },
    
    methods: {
      async fetchMitigationHistory() {
        try {
          this.loading = true;
          const response = await axios.get('http://localhost:5001/api/mitigationHistory', {
            params: { limit: 20 }
          });
          
          this.mitigationHistory = response.data;
          
          // Calculate stats
          this.mitigationStats.total = this.mitigationHistory.length;
          this.mitigationStats.successful = this.mitigationHistory.filter(
            m => m.status === 'completed'
          ).length;
          this.mitigationStats.failed = this.mitigationHistory.filter(
            m => m.status === 'failed'
          ).length;
        } catch (error) {
          console.error('Error fetching mitigation history:', error);
          this.toast.error('Failed to fetch mitigation history');
        } finally {
          this.loading = false;
        }
      },
      
      async fetchEffectivenessMetrics() {
        try {
          const response = await axios.get('http://localhost:5001/api/mitigationEffectiveness');
          this.effectivenessMetrics = response.data;
        } catch (error) {
          console.error('Error fetching mitigation effectiveness:', error);
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
      },
      
      capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
      
      getSeverityClass(severity) {
        switch (severity) {
          case 'critical': return 'severity-critical';
          case 'high': return 'severity-high';
          case 'medium': return 'severity-medium';
          case 'low': return 'severity-low';
          default: return '';
        }
      },
      
      formatMetricLabel(type) {
        // Format camelCase to Title Case with spaces
        return type
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      },
      
      summarizeActions(actions) {
        if (!actions || !Array.isArray(actions)) return 'No actions';
        
        // Count action types
        const actionTypes = actions.map(a => a.type);
        const uniqueTypes = [...new Set(actionTypes)];
        
        return uniqueTypes.join(', ');
      },
      
      async testMitigation() {
        if (!this.newMitigation.threatType || !this.newMitigation.riskScore) {
          this.toast.error('Please fill in the required fields');
          return;
        }
        
        try {
          this.loading = true;
          
          // Create details object
          const details = {
            description: this.newMitigation.description
          };
          
          // Add IP if provided
          if (this.newMitigation.ip) {
            details.ip = this.newMitigation.ip;
          }
          
          // Trigger mitigation
          const response = await axios.post('http://localhost:5001/api/mitigateThreat', {
            threatType: this.newMitigation.threatType,
            riskScore: this.newMitigation.riskScore,
            details
          });
          
          // Show success message
          this.toast.success('Mitigation initiated successfully');
          
          // Close dialog
          this.showMitigateDialog = false;
          
          // Reset form
          this.newMitigation = {
            threatType: '',
            riskScore: 15,
            ip: '',
            description: ''
          };
          
          // Refresh data
          setTimeout(() => {
            this.fetchMitigationHistory();
            this.fetchEffectivenessMetrics();
          }, 1000);
        } catch (error) {
          console.error('Error initiating mitigation:', error);
          this.toast.error('Failed to initiate mitigation');
        } finally {
          this.loading = false;
        }
      }
    },
    
    mounted() {
      this.fetchMitigationHistory();
      this.fetchEffectivenessMetrics();
      
      // Poll for updates every 30 seconds
      this.interval = setInterval(() => {
        this.fetchMitigationHistory();
        this.fetchEffectivenessMetrics();
      }, 30000);
    },
    
    beforeUnmount() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  };
  </script>
  
  <style scoped>
  .mitigation-dashboard {
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333; /* Default text color for better visibility */
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #333; /* Ensuring text is dark on white background */
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-weight: 500;
  }
  
  .stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  
  .stat {
    flex: 1;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #2c5282; /* Blue color for stats */
  }
  
  .stat-label {
    font-size: 14px;
    color: #333; /* Making labels darker for better visibility */
    margin-top: 5px;
  }
  
  .effectiveness-chart {
    margin-top: 10px;
  }
  
  .metric {
    margin-bottom: 15px;
  }
  
  .metric-label {
    margin-bottom: 5px;
    font-weight: 500;
    color: #333; /* Darker color for labels */
  }
  
  .metric-bar {
    height: 12px;
    background-color: #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .metric-fill {
    height: 100%;
    background-color: #4299e1;
    border-radius: 6px;
  }
  
  .metric-value {
    display: inline-block;
    margin-top: 5px;
    margin-right: 5px;
    font-weight: 500;
    color: #333; /* Darker color for better visibility */
  }
  
  .metric-count {
    display: inline-block;
    color: #333; /* Changed from light gray to dark gray */
    font-size: 14px;
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .mitigation-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .mitigation-table th,
  .mitigation-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    color: #333; /* Making table text darker */
  }
  
  .mitigation-table th {
    background-color: #f7fafc;
    font-weight: 600;
    color: #333; /* Darker header text */
  }
  
  .severity-critical {
    border-left: 4px solid #e53e3e;
  }
  
  .severity-high {
    border-left: 4px solid #ed8936;
  }
  
  .severity-medium {
    border-left: 4px solid #ecc94b;
  }
  
  .severity-low {
    border-left: 4px solid #48bb78;
  }
  
  .action-btn {
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .action-btn:hover {
    background-color: #3182ce;
  }
  
  .cancel-btn {
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-left: 10px;
  }
  
  .cancel-btn:hover {
    background-color: #cbd5e0;
  }
  
  .dialog {
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
    color: #333; /* Ensuring dialog text is dark */
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333; /* Darker label text */
  }
  
.form-control, 
input[type="text"], 
input[type="number"], 
textarea, 
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
}
  
  .form-control::placeholder {
    color: #a0aec0; /* Medium gray placeholder text */
  }
  
  textarea.form-control {
    min-height: 100px;
  }
  
  .dialog-actions {
    margin-top: 20px;
    text-align: right;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-cards {
      grid-template-columns: 1fr;
    }
    
    .stats {
      flex-direction: column;
    }
    
    .stat {
      margin-bottom: 15px;
    }
  }
  </style>