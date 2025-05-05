# ShopSmart Solutions - Real-Time Threat Intelligence (RTTI) Platform
# System Manual

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Backend Services](#backend-services)
7. [Security Features](#security-features)
8. [Integration Points](#integration-points)
9. [Maintenance & Updates](#maintenance--updates)
10. [Monitoring & Logging](#monitoring--logging)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting & Recovery](#troubleshooting--recovery)

## System Architecture

### Overview
The Real-Time Threat Intelligence (RTTI) system is built on a modern web architecture featuring a Vue.js frontend, Node.js backend, and PostgreSQL database with Supabase integration. It connects to external OSINT APIs to gather real-time threat intelligence.

### Components Diagram
```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Vue.js       │      │  Node.js      │      │  PostgreSQL   │
│  Frontend     │◄────►│  Backend      │◄────►│  Database     │
└───────────┬───┘      └───────┬───────┘      └───────────────┘
            │                  │
┌───────────▼──────────────────▼───────────┐
│            OSINT Integration              │
├─────────────┬─────────────┬──────────────┤
│  Shodan     │  HIBP       │  VirusTotal  │
└─────────────┴─────────────┴──────────────┘
```

### Technology Stack
- **Frontend**: Vue.js 3, Vuetify, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Supabase
- **OSINT APIs**: Shodan, Have I Been Pwned, VirusTotal
- **LLM Integration**: Hugging Face or OpenAI API for risk analysis

> **Note**: Although the architecture diagram shows all components, some advanced features are partially implemented or planned for future releases.

## Installation & Setup

### Prerequisites
- Node.js v16+ 
- npm v8+
- PostgreSQL 13+
- Access to Supabase
- API keys for OSINT services

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZachJGreen/real-time-threat-intelligence.git
   cd real-time-threat-intelligence
   ```

2. **Install backend dependencies**
   ```bash
   cd src/backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd src/frontend/shopsmart-project
   npm install
   ```

4. **Set up environment variables**
   Create `.env` file in the project root:
   ```
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   
   # OSINT APIs
   SHODAN_API_KEY=your_shodan_key
   HIBP_API_KEY=your_hibp_key
   VIRUSTOTAL_API_KEY=your_virustotal_key
   
   # Email Alerts
   ALERT_EMAIL_USER=your_gmail_address
   ALERT_EMAIL_PASS=your_app_password
   ADMIN_EMAIL=admin@example.com
   
   # Webhook
   WEBHOOK_URL=your_webhook_url
   
   # Logging
   LOG_DIR=logs
   LOG_LEVEL=INFO
   
   # Server
   PORT=5001
   ```

5. **Initialize the database**
   ```bash
   psql -U postgres -d your_database_name -f db/schema.sql
   psql -U postgres -d your_database_name -f db/sample_data.sql
   ```

6. **Start development servers**
   
   Backend:
   ```bash
   cd src/backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd src/frontend/shopsmart-project
   npm run dev
   ```

## Configuration

### Backend Configuration

All backend configuration is managed through environment variables. See the `.env` file template in the Installation section for required variables.

### Frontend Configuration

Frontend configuration is managed in the `src/frontend/shopsmart-project/.env` file:

```
VITE_API_URL=http://localhost:5001
VITE_DEFAULT_REFRESH_INTERVAL=30000
```

### OSINT API Configuration

Each OSINT API requires specific setup:

#### Shodan
- Register at [shodan.io](https://account.shodan.io/register)
- Obtain API key from your account dashboard
- Add to `.env` as `SHODAN_API_KEY`

#### Have I Been Pwned
- Register at [haveibeenpwned.com/API](https://haveibeenpwned.com/API/Key)
- Obtain API key
- Add to `.env` as `HIBP_API_KEY`

#### VirusTotal
- Register at [virustotal.com](https://www.virustotal.com/gui/join-us)
- Obtain API key from your account settings
- Add to `.env` as `VIRUSTOTAL_API_KEY`

### Risk Scoring Configuration

Edit `src/backend/risk_scoring.js` to modify risk scoring parameters:

```javascript
// Default options for risk calculation
const DEFAULT_OPTIONS = {
    decayRate: 0.05,    // 5% reduction per day since last seen
    minDecay: 0.1       // Minimum decay factor (never below 10%)
};
```

## API Reference

### Endpoints

#### Threat Intelligence Endpoints

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/getThreatData` | GET | Retrieve all threat data | None | Array of threat objects |
| `/api/getHighRiskThreats` | GET | Get threats with risk score > 15 | None | Array of high-risk threat objects |
| `/api/fetchShodanThreatData` | POST | Fetch threat data from Shodan | `{ ip: "192.168.1.1" }` | Success message with risk score |
| `/api/incidentResponse` | GET | Get incident response plan | `?threatType=SQL%20Injection` | Response plan steps |
| `/api/performCBA` | POST | Perform cost-benefit analysis | `{ threatId: "1", threatType: "SQL Injection", assetValue: 100000 }` | Array of CBA results |

#### Alert Management Endpoints

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/getRecentAlerts` | GET | Get 10 most recent alerts | None | Array of alert objects |
| `/api/getAllAlerts` | GET | Get all active alerts | None | Array of alert objects |
| `/api/createAlert` | POST | Create a new alert | `{ threat_name: "SQL Injection", risk_score: 20, description: "..." }` | Created alert object |
| `/api/updateAlertStatus` | POST | Update alert status | `{ id: "1", status: "Acknowledged" }` | Updated alert object |

### Request/Response Examples

#### Get Threat Data
```
GET /api/getThreatData

Response:
[
  {
    "id": 1,
    "threat_name": "SQL Injection",
    "asset_name": "Web Server",
    "vulnerability_name": "Unvalidated Input",
    "likelihood": 4,
    "impact": 5,
    "risk_score": 20
  },
  ...
]
```

#### Create Alert
```
POST /api/createAlert
{
  "threat_name": "SQL Injection",
  "risk_score": 20,
  "description": "Potential SQL injection attempt detected on login page"
}

Response:
{
  "message": "Alert created successfully",
  "data": {
    "id": 42,
    "alert_type": "Critical",
    "risk_score": 20,
    "description": "Potential SQL injection attempt detected on login page",
    "status": "Open",
    "created_at": "2025-04-16T15:30:45.123Z"
  }
}
```

## Database Schema

### Core Tables

#### assets
```sql
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN ('Hardware', 'Software', 'Data', 'People', 'Process')),
    description TEXT,
    criticality INTEGER CHECK (criticality BETWEEN 1 AND 5),
    owner VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### threats
```sql
CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    threat_name VARCHAR(255) NOT NULL,
    threat_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### vulnerabilities
```sql
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    vulnerability_name VARCHAR(255) NOT NULL,
    description TEXT,
    cve_id VARCHAR(20),
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### tva_mapping
```sql
CREATE TABLE tva_mapping (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    threat_id INTEGER REFERENCES threats(id),
    vulnerability_id INTEGER REFERENCES vulnerabilities(id),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### threat_data
```sql
CREATE TABLE threat_data (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    ports JSONB,
    services JSONB,
    hostnames JSONB,
    vulns JSONB,
    last_scan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### alerts
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    threat_id INTEGER REFERENCES threats(id),
    risk_score INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Acknowledged', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

#### security_logs
```sql
CREATE TABLE security_logs (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    risk_score INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    source VARCHAR(100)
);
```

### Entity Relationship Diagram

```
assets 1──┐
           └─* tva_mapping *──┐ threats
vulnerabilities 1─────────────┘
              ┌── threat_data
              │
assets *─┐    │
         │    │
threats 1─┼────│──* alerts
         │    │
vulnerabilities *
              │
              └── security_logs
```

## Backend Services

### Core Services

#### Server (server.js)
The main Express.js application that handles HTTP requests and serves API endpoints.

**Key Functions:**
- Route handling for all API endpoints
- Authentication and authorization (planned for future implementation)
- Error handling and logging

#### OSINT Integration (api/shodan_integration.js, api/fetch_osint.js)
Services that fetch and process threat intelligence from external OSINT APIs.

**Key Functions:**
- Fetching data from Shodan and other sources
- Storing threat intelligence in the database
- Triggering alerts for detected threats

#### Risk Scoring (src/backend/risk_scoring.js)
Calculates risk scores for detected threats based on likelihood, impact, and time factors.

**Key Functions:**
- Time-weighted risk calculation
- Risk score decay over time

#### Alerting System (src/backend/alerts.js)
Handles detection and notification of security alerts.

**Key Functions:**
- Alert creation and management
- Email and webhook notification
- Alert status tracking

#### Cost-Benefit Analysis (src/backend/cba_analysis.js)
Performs financial analysis of security controls.

**Key Functions:**
- Calculate Annual Loss Expectancy (ALE)
- Evaluate security control effectiveness
- Calculate Return on Security Investment (ROSI)

#### Incident Response (src/backend/incident_response.js)
Provides response plans for security incidents.

**Key Functions:**
- Generate incident response plans based on threat type
- Track incident response activities

#### Logging System (src/backend/logging.js)
Comprehensive logging system for all platform activities.

**Key Functions:**
- Log rotation and management
- Multiple log streams (threat, system, access)
- Database logging for critical events

### Service Dependencies

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ server.js   │────►│ supabase.js │◄────│ logging.js  │
└─────┬───────┘     └─────────────┘     └─────────────┘
      │                    ▲                   ▲
      │                    │                   │
      ├─────────┬─────────┴───────────────────┘
      │         │         │
┌─────▼───┐ ┌───▼─────┐ ┌─▼───────────┐
│ alerts  │ │ shodan  │ │ risk_scoring│
└─────────┘ └─────────┘ └─────────────┘
```

## Security Features

### Blue Team Defense

The system includes automated defense mechanisms to respond to threats.

#### Firewall Automation (src/backend/blue_team_defense.js)
Automatically updates firewall rules based on threat intelligence.

**Key Functions:**
- Block malicious IPs
- Implement rate limiting for DDoS protection
- Protect against brute force attacks

#### Mitigation Recommendations (src/backend/mitigation_recommendations.js)
Provides actionable recommendations for mitigating detected threats.

**Key Functions:**
- Recommend security controls based on threat type
- Prioritize recommendations based on effectiveness

### Data Protection

#### API Caching
The system implements caching to minimize API calls and protect sensitive data.

```javascript
// Example API caching in api_optimizer.js
async function checkCache(ip) {
    const { data: cached, error } = await supabase
        .from(CACHE_TABLE)
        .select('response, expires_at')
        .eq('api_type', 'shodan')
        .eq('query_key', ip)
        .single();

    const now = new Date();

    if (cached && !error && new Date(cached.expires_at) > now) {
        console.log(`[CACHE] Using cached result for ${ip}`);
        return cached.response;
    }

    return null;
}
```

#### Secure Environment Variables
Sensitive configuration is stored in environment variables, not in the codebase.

## Integration Points

### OSINT API Integration

The system integrates with multiple OSINT sources:

#### Shodan Integration
```javascript
// Example from shodan_integration.js
async function fetchShodanData(ip) {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;
    const response = await axios.get(url);
    return response.data;
}
```

#### Have I Been Pwned (Planned)
```javascript
// Future implementation
async function checkBreachedCredentials(email) {
    const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`;
    const response = await axios.get(url, {
        headers: { 'hibp-api-key': HIBP_API_KEY }
    });
    return response.data;
}
```

#### VirusTotal (Planned)
```javascript
// Future implementation
async function scanFile(fileHash) {
    const url = `https://www.virustotal.com/api/v3/files/${fileHash}`;
    const response = await axios.get(url, {
        headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
    });
    return response.data;
}
```

### Alert Notification Integration

The system can send alerts through multiple channels:

#### Email Notifications
```javascript
// Example from alerts.js
async function sendEmailAlert(threatName, riskScore) {
    const mailOptions = {
        from: process.env.ALERT_EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 High-Risk Threat Detected: ${threatName}`,
        text: `A critical threat has been detected.\n\nThreat: ${threatName}\nRisk Score: ${riskScore}`
    };

    await transporter.sendMail(mailOptions);
}
```

#### Webhook Notifications
```javascript
// Example from alerts.js
async function sendWebhookAlert(threatName, riskScore) {
    await axios.post(process.env.WEBHOOK_URL, {
        threatName,
        riskScore,
        message: 'Critical threat detected!',
        timestamp: new Date().toISOString()
    });
}
```

## Maintenance & Updates

### Database Maintenance

#### Regular Backups
Set up automated backups of the PostgreSQL database:

```bash
# Daily backup script
pg_dump -U postgres -d rtti_database > /backup/rtti_$(date +%Y%m%d).sql
```

#### Database Optimization
Run the optimization stored procedure weekly:

```sql
CALL maintenance_optimize();
```

### Frontend Updates

To update the frontend application:

```bash
cd src/frontend/shopsmart-project
git pull
npm install
npm run build
# Copy build directory to web server
```

### Backend Updates

To update the backend application:

```bash
cd src/backend
git pull
npm install
# Restart the service
pm2 restart rtti-backend
```

### Checking for Updates

Check the repository regularly for updates:

```bash
git fetch
git log HEAD..origin/main
```

## Monitoring & Logging

### Logging System

The platform includes a comprehensive logging system in `src/backend/logging.js`.

#### Log Types
- **threat_events.log**: Records all detected threats
- **system.log**: System operations and status
- **access.log**: API and endpoint access
- **error.log**: Errors and exceptions

#### Log Rotation
Logs are automatically rotated when they reach 10MB to prevent disk space issues.

#### Database Logging
Critical events are also stored in the `security_logs` table for persistent storage.

### Log Analysis

To view recent logs:

```bash
# View recent threat logs
tail -f logs/threat_events.log

# View API access logs
tail -f logs/access.log
```

To query database logs:

```sql
-- View critical security events from the past 24 hours
SELECT * FROM security_logs
WHERE severity = 'CRITICAL'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Performance Optimization

### Database Optimization

The database includes optimized queries and indexes for performance:

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tva_risk ON tva_mapping(risk_score);
CREATE INDEX IF NOT EXISTS idx_ip_address ON threat_data(ip_address);
CREATE INDEX IF NOT EXISTS idx_alert_status ON alerts(status);
```

Materialized views are used for dashboard queries:

```sql
-- Create materialized view for high-risk threats
CREATE MATERIALIZED VIEW mv_high_risk_threats AS
SELECT 
    t.id AS threat_id,
    t.threat_name,
    a.id AS asset_id,
    a.asset_name,
    tva.risk_score
FROM 
    tva_mapping tva
JOIN 
    threats t ON tva.threat_id = t.id
JOIN 
    assets a ON tva.asset_id = a.id
WHERE 
    tva.risk_score > 15
ORDER BY 
    tva.risk_score DESC;
```

### API Optimization

The system implements caching to reduce API calls:

```javascript
// Example of API caching
async function getOptimizedThreatData(ip, options = {}) {
    // Check cache first
    const cachedData = await checkCache(ip);
    if (cachedData && !options.forceFresh) {
        return cachedData;
    }
    
    // Fetch fresh data if no cache hit
    const data = await fetchFromApi(ip);
    
    // Cache the new data
    await cacheResponse(ip, data, options.cacheHours || 6);
    
    return data;
}
```

## Troubleshooting & Recovery

### Common Issues

#### Server Not Starting
- Check for syntax errors in JavaScript files
- Verify all dependencies are installed
- Ensure environment variables are set correctly

```bash
# Check for missing dependencies
npm install

# Verify .env file exists
ls -la .env

# Check the logs
cat logs/error.log
```

#### Database Connection Issues
- Verify the Supabase URL and key in `.env`
- Check if Supabase is accessible
- Test the connection with a simple query

```bash
# Test the Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
supabase.from('assets').select('*').limit(1).then(console.log).catch(console.error);
"
```

#### API Integration Failures
- Verify API keys in `.env`
- Check API rate limits
- Try a simple request to the API directly

```bash
# Test Shodan API
curl -s "https://api.shodan.io/shodan/host/8.8.8.8?key=$SHODAN_API_KEY" | jq
```

### Log Analysis for Troubleshooting

To diagnose issues through log analysis:

```bash
# Check for errors in the error log
grep "ERROR" logs/error.log

# Find issues with specific API
grep "Shodan" logs/system.log

# Look for authorization failures
grep "Unauthorized" logs/access.log
```

### Recovery Procedures

#### Database Recovery
To restore the database from a backup:

```bash
# Restore from backup
psql -U postgres -d rtti_database -f /backup/rtti_20250415.sql
```

#### API Key Rotation
If an API key is compromised:

1. Generate a new key from the API provider's website
2. Update the `.env` file with the new key
3. Restart the application:
   ```bash
   pm2 restart rtti-backend
   ```

---

© 2025 ShopSmart Solutions | Real-Time Threat Intelligence Platform | v1.0