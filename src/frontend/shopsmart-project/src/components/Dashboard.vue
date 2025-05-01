<template>
  <div class="container">
    <h1>Main Dashboard</h1>

    <button @click="showDashboard = !showDashboard" class="dashboard-btn">
      {{  showDashboard ? "Hide Dashboard" : "Show Dashboard "}}
    </button>
    
    <ThreatDashboard v-if="showDashboard" />
  </div>
</template>


<script>
import ThreatDashboard from "./ThreatDashboard.vue";
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  name: "Dashboard",
  components: {
    ThreatDashboard,
  },
  data() {
    return {
      showDashboard: false,
      alerts: [],
      toast: useToast(),
      alertsPollingInterval: null,
    };
  },
  methods: {
    
    async fetchAlerts(){
      try{
        const response = await axios.get('http://localhost:5000/api/getRecentAlerts');
        this.alerts = response.data;
      } catch (error) {
        console.error('Error fetching alerts:', error);
        this.toast.error('Failed to fetch alerts from the server');
      }
    },

    receiveThreat(newThreat) {
      this.alerts.push(newThreat);

      if (newThreat.riskScore > 20) {
        this.notifyCriticalThreat(newThreat);
      }

      this.toast.info(`New threat detected: ${newThreat.name}`, {
        timeout: 5000,
      });
    },

    async notifyCriticalThreat(threat) {
      console.log(`Critical Threat Detected: ${threat.name}`);

      const webhookUrl = "https://real-webhook-url.com/alert";

      try {

        await axios.post('http://localhost:5000/api/createAlert', {
          threat_name: threat.name,
          risk_score: threat.riskScore,
          description: `Critical Threat: ${threat.name}`
        });

        this.toast.success(`🚨 Alert created for ${threat.name}`, {
          timeout: 5000,
        });

        // Refresh the alerts
        this.fetchAlerts();
      } catch (error) {
        console.error("Error sending alert:", error.response || error.message);
        this.toast.error("❌ Failed to create alert. Check console for details.", {
          timeout: 6000,
        });
      }
    }
  },

  mounted() {
    // Fetch alerts when component mounts
    this.fetchAlerts();

    // Set up polling for alerts every 30 seconds
    this.alertsPollingInterval = setInterval(() => {
      this.fetchAlerts();
    }, 30000);

    // Simulating new threats every 5 seconds
    setInterval(() => {
      const newThreat = {
        id: Date.now(),
        name: `Threat ${Math.floor(Math.random() * 100)}`,
        riskScore: Math.floor(Math.random() * 60),
      };
      this.receiveThreat(newThreat);
    }, 5000);
  },

  beforeUnmount() {
    // Clear the polling interval when component is unmounted
    if (this.alertsPollingInterval) {
      clearInterval(this.alertsPollingInterval);
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