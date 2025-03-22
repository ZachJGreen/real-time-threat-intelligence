<template>
  <div>
    <h1>"Welcome to ShopSmart solutions</h1>
    <h2>Real-Time Threat Intelligence</h2>

    <table>
      <thead>
        <tr>
          <th>Threat Name</th>
          <th>Risk Score</th>
          <th>Vulnerabilities</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="threat in threats"
          :key="threat.id"
          :class="{ 'high-risk': threat.riskScore > 20 }"
        >
          <td>{{ threat.name }}</td>
          <td>{{ threat.riskScore }}</td>
          <td>{{ threat.vulnerability }}</td>
        </tr>
      </tbody>
    </table>

    <button @click="sendCriticalAlert">Simulate Critical Alert</button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const threats = ref([]);

    // List of real-world threats and vulnerabilities
    const threatsList = [
      { name: "SQL Injection", vulnerability: "Injection Flaws" },
      { name: "Cross-Site Scripting (XSS)", vulnerability: "Improper Input Validation" },
      { name: "Denial-of-Service (DoS)", vulnerability: "Resource Exhaustion" },
      { name: "Man-in-the-Middle (MITM)", vulnerability: "Weak Encryption" },
      { name: "Zero-Day Exploit", vulnerability: "Unknown Software Vulnerability" },
      { name: "Phishing Attack", vulnerability: "Social Engineering" },
      { name: "Ransomware Attack", vulnerability: "Unpatched Software" },
      { name: "Cross-Site Request Forgery (CSRF)", vulnerability: "Session Hijacking" },
      { name: "Brute Force Attack", vulnerability: "Weak Passwords" },
      { name: "Malware Injection", vulnerability: "Unsecured File Uploads" },
    ];

    const receiveThreat = (newThreat) => {
      threats.value.push(newThreat);
    };

    const sendCriticalAlert = () => {
      const testThreat = {
        id: Date.now(),
        name: "Test Critical Threat",
        riskScore: 55,
        vulnerability: "SQL Injection", // Example vulnerability
      };
      receiveThreat(testThreat);
    };

    onMounted(() => {
      setInterval(() => {
        const newThreat = {
          id: Date.now(),
          name: `Threat ${Math.floor(Math.random() * 100)}`,
          riskScore: Math.floor(Math.random() * 60),
          vulnerability: ["XSS", "CSRF", "SQL Injection", "Buffer Overflow"][
            Math.floor(Math.random() * 4)
          ],
        };
        receiveThreat(newThreat);
      }, 5000);
    });

    return {
      threats,
      sendCriticalAlert,
    };
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 25px;
}

th, td {
  border: 1.5px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #1a237e;
}

.high-risk {
  background-color: #e8eaf6; 
}
</style>
