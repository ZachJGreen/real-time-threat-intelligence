-- Assets Table 
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN ('Hardware', 'Software', 'Data', 'People', 'Process')),
    description TEXT,
    criticality INTEGER CHECK (criticality BETWEEN 1 AND 5) DEFAULT 3,
    owner VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threats Table 
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    threat_name VARCHAR(255) NOT NULL,
    threat_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vulnerabilities Table 
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id SERIAL PRIMARY KEY,
    vulnerability_name VARCHAR(255) NOT NULL,
    description TEXT,
    cve_id VARCHAR(20),
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TVA Mapping Table 
CREATE TABLE IF NOT EXISTS tva_mapping (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    threat_id INTEGER REFERENCES threats(id),
    vulnerability_id INTEGER REFERENCES vulnerabilities(id),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Shodan Threat Data Table 
CREATE TABLE IF NOT EXISTS threat_data (
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

-- Alert Logs Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    threat_id INTEGER REFERENCES threats(id),
    risk_score INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Acknowledged', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Incident Response Logs Table (new)
CREATE TABLE IF NOT EXISTS incident_logs (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id),
    response_plan TEXT,
    action_taken TEXT,
    responder VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for tracking API requests to prevent redundant calls
CREATE TABLE IF NOT EXISTS api_cache (
    id SERIAL PRIMARY KEY,
    api_type VARCHAR(50) NOT NULL,
    query_key VARCHAR(255) NOT NULL,
    response JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint on query_key and api_type
CREATE UNIQUE INDEX idx_api_cache ON api_cache(api_type, query_key);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_threat_type ON threats(threat_type);
CREATE INDEX IF NOT EXISTS idx_tva_asset ON tva_mapping(asset_id);
CREATE INDEX IF NOT EXISTS idx_tva_threat ON tva_mapping(threat_id);
CREATE INDEX IF NOT EXISTS idx_tva_risk ON tva_mapping(risk_score);
CREATE INDEX IF NOT EXISTS idx_ip_address ON threat_data(ip_address);
CREATE INDEX IF NOT EXISTS idx_alert_status ON alerts(status);
