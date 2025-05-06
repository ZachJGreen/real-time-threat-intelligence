<!-- File: src/frontend/shopsmart-project/src/components/CostBenefitAnalysis.vue -->
<template>
    <div class="cba-container">
      <h2>Cost-Benefit Analysis</h2>
      
      <div class="form-section">
        <h3>Analyze Security Control ROI</h3>
        <div class="form-group">
          <label for="threatSelect">Select Threat:</label>
          <select id="threatSelect" v-model="selectedThreat" class="form-control">
            <option value="">-- Select a Threat --</option>
            <option 
              v-for="threat in threats" 
              :key="threat.id" 
              :value="threat"
            >
              {{ threat.threat_name }} (Risk Score: {{ threat.risk_score }})
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="assetValue">Asset Value ($):</label>
          <input 
            type="number" 
            id="assetValue" 
            v-model.number="assetValue" 
            class="form-control"
            min="1"
          />
        </div>
        
        <button @click="performAnalysis" class="analyze-btn" :disabled="!canAnalyze">
          Analyze Security Controls
        </button>
      </div>
      
      <div v-if="loading" class="loading">
        <p>Analyzing security controls...</p>
      </div>
      
      <div v-if="results.length > 0" class="results-section">
        <h3>Analysis Results</h3>
        <div class="table-responsive">
          <table class="cba-table">
            <thead>
              <tr>
                <th>Security Control</th>
                <th>Initial Risk ($)</th>
                <th>Residual Risk ($)</th>
                <th>Risk Reduction ($)</th>
                <th>Control Cost ($)</th>
                <th>Net Benefit ($)</th>
                <th>ROI (%)</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, index) in results" :key="index" :class="result.rosi > 0 ? 'positive-roi' : 'negative-roi'">
                <td>{{ result.controlName }}</td>
                <td>${{ formatNumber(result.initialRisk) }}</td>
                <td>${{ formatNumber(result.residualRisk) }}</td>
                <td>${{ formatNumber(result.riskReduction) }}</td>
                <td>${{ formatNumber(result.controlCost) }}</td>
                <td>
                  <span :class="result.netBenefit > 0 ? 'positive' : 'negative'">
                    ${{ formatNumber(result.netBenefit) }}
                  </span>
                </td>
                <td>{{ formatNumber(result.rosi) }}%</td>
                <td class="recommendation">{{ result.recommendation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="control-details" v-if="selectedControl">
          <h4>{{ selectedControl.controlName }} Details</h4>
          <p>{{ selectedControl.description }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'CostBenefitAnalysis',
    props: {
      threats: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        selectedThreat: null,
        assetValue: 100000,
        results: [],
        loading: false,
        selectedControl: null
      };
    },
    computed: {
      canAnalyze() {
        return this.selectedThreat && this.assetValue > 0;
      }
    },
    methods: {
      async performAnalysis() {
        if (!this.canAnalyze) return;
        
        this.loading = true;
        this.results = [];
        
        try {
          const response = await axios.post('http://localhost:5001/api/performCBA', {
            threatId: this.selectedThreat.id,
            threatType: this.selectedThreat.threat_name,
            assetValue: this.assetValue
          });
          
          this.results = response.data;
          
          // Select the first control by default
          if (this.results.length > 0) {
            this.selectedControl = this.results[0];
          }
        } catch (error) {
          console.error('Error performing CBA:', error);
          alert('Failed to perform cost-benefit analysis. Please try again.');
        } finally {
          this.loading = false;
        }
      },
      formatNumber(value) {
        return Number(value).toLocaleString(undefined, {
          maximumFractionDigits: 2
        });
      },
      selectControl(control) {
        this.selectedControl = control;
      }
    }
  };
  </script>
  
  <style scoped>
  .cba-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2, h3, h4 {
    color: #333;
    margin-bottom: 20px;
  }
  
  .form-section {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    background-color: white;
    color: #333;
  }
  
  .analyze-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .analyze-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
  }
  
  .results-section {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .cba-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .cba-table th, .cba-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    color: #333;
  }
  
  .cba-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    color: #333;
  }
  
  .cba-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .positive-roi {
    background-color: rgba(76, 175, 80, 0.1);
  }
  
  .negative-roi {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  .positive {
    color: green;
  }
  
  .negative {
    color: red;
  }
  
  .recommendation {
    font-weight: bold;
    color: #333;
  }
  
  .control-details {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
    margin-top: 20px;
    color: #333;
  }
  
  @media (max-width: 768px) {
    .cba-table {
      font-size: 14px;
    }
    
    .cba-table th, .cba-table td {
      padding: 8px;
    }
  }
  </style>