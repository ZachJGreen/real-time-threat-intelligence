export const threatData = JSON.stringify([
    {
      name: "SQL Injection",
      likelihood: "High",
      impact: "Critical",
      risk_score: 9.8
    },
    {
      name: "Cross-Site Scripting",
      likelihood: "Medium",
      impact: "Moderate",
      risk_score: 6.5
    }
  ]);
  
  export const threatLogData = JSON.stringify([
    {
      threat_name: "SQL Injection",
      asset_name: "Database Server",
      vulnerability_name: "SQL Injection vulnerability in user login",
      likelihood: "High",
      impact: "Critical",
      risk_score: 9.8
    },
    {
      threat_name: "Cross-Site Scripting",
      asset_name: "Web Application",
      vulnerability_name: "XSS vulnerability in comment section",
      likelihood: "Medium",
      impact: "Moderate",
      risk_score: 6.5
    }
  ]);
  