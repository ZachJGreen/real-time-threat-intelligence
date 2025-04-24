# Troubleshooting & Maintenance Guide – Real-Time Threat Intelligence System

---

## Common Issues & Fixes

### 1. System Not Starting
- **Symptoms**: Frontend not loading, backend server unresponsive.
- **Possible Causes**:
  - Missing environment variables.
  - Corrupted build or uninstalled dependencies.
- **Fixes**:
  - Verify `.env` values (API keys, DB URL, etc.).
  - Run `npm install` (Vue.js) and `npm install` (Node.js backend).
  - Restart services using `npm run dev` or equivalent PM2/Nodemon commands.

### 2. Database Connection Errors (PostgreSQL)
- **Symptoms**: Risk scoring module fails, data queries timeout.
- **Possible Causes**:
  - PostgreSQL service not running.
  - Invalid DB credentials or misconfigured URI.
- **Fixes**:
  - Ensure `postgres` is running locally or via cloud instance.
  - Check `.env` for `DATABASE_URL` and test with `psql`.
  - Restart the backend and validate using logs.

### 3. API Integration Failures (OSINT Tools)
- **Symptoms**: Shodan, HIBP, or VirusTotal data not rendering in the dashboard.
- **Possible Causes**:
  - Expired or invalid API keys.
  - Incorrect API endpoints or parameters.
  - Logic errors in integration scripts.
- **Fixes**:
  - Check access logs and error output in:
    - `api/fetch_osint.js`
    - `api/shodan_integration.js`
    - `api/shodan.js`
  - Validate API keys and scopes (Shodan, HIBP, VirusTotal).
  - Check `.env` for correct API key names and values.
  - Test each endpoint manually using `curl` or Postman.
  - Rotate or regenerate keys if they’ve expired or been revoked.

### 4. Risk Scoring/LLM Module Errors
- **Symptoms**: LLM not responding, scoring inconsistencies.
- **Possible Causes**:
  - Malformed input or memory overload.
- **Fixes**:
  - Inspect `src/backend/risk_analysis.js` for model inputs.
  - Optimize model calls (batching, pre-validation).
  - Restart service and monitor logs.

### 5. UI or Dashboard Display Issues (Vue.js)
- **Symptoms**: Blank pages or broken component rendering.
- **Possible Causes**:
  - Failed build, outdated frontend package.
- **Fixes**:
  - Run `npm run build` and serve static files correctly.
  - Debug `ThreatDashboard.vue` for logic/rendering errors.

---

## Best Practices for Maintenance

### Backups
- Use automated backups for PostgreSQL and config files weekly.
- Store copies securely on cloud (AWS S3 or Google Drive).

### Monitoring & Logging
- Enable Docker logging or PM2 log stream.
- Monitor real-time threat logs in `/src/backend/logging.js`.
- Integrate external tools (e.g., Grafana) for system health.

### Security
- Regularly run vulnerability scans with OWASP ZAP or Nmap.
- Keep dependencies updated with `npm audit fix` or `pip list --outdated`.
- Use environment variables for all sensitive values.

### Documentation
- Update `/docs/troubleshooting_guide.md` with new issues and resolutions.
- Maintain `CHANGELOG.md` for every major system iteration.

---

Last updated: April 20, 2025

