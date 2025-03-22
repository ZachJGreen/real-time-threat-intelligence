<template>
  <div>
    <h2>Real-Time Threat Intelligence Dashboard</h2>

    <!-- Filter input -->
    <input
      type="text"
      v-model="filter"
      placeholder="Filter by IP address"
      @input="filterData"
    />

    <table>
      <thead>
        <tr>
          <th>IP Address</th>
          <th>Ports</th>
          <th>Services</th>
          <th>Risk Score</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loop through the filtered threats -->
        <tr v-for="(threat, index) in filteredThreats" :key="index">
          <td>{{ threat.ip_address }}</td>
          <td>{{ threat.ports.join(", ") }}</td>
          <td>{{ threat.services.join(", ") }}</td>
          <td>{{ threat.risk_score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// State for holding all threats and filtered threats
const threats = ref([]);
const filteredThreats = ref([]);
const filter = ref("");

// Fetch threat data from the backend API
const fetchThreatData = async () => {
  try {
    const response = await axios.get('/api/threats');
    console.log(response.data); // Log the fetched data
    threats.value = response.data;
    filteredThreats.value = response.data;
  } catch (error) {
    console.error('Error fetching threat data:', error);
  }
};


// Filter the data based on the user input
const filterData = () => {
  if (filter.value.trim() === "") {
    filteredThreats.value = threats.value;
  } else {
    filteredThreats.value = threats.value.filter((threat) =>
      threat.ip_address.toLowerCase().includes(filter.value.trim().toLowerCase())
    );
  }
};


// Fetch the data when the component is mounted
onMounted(() => {
  fetchThreatData();
});
</script>

<style scoped>
/* Add any styles for the dashboard */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

table, th, td {
  border: 1px solid black;
}

th, td {
  padding: 10px;
  text-align: left;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  max-width: 300px;
  margin-right: 10px;
}
</style>

