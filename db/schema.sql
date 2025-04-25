-- Contains all SQL code to initialize database and functions

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



--- FUNCTIONS ---

-- Function to calculate risk score with time decay factor
CREATE OR REPLACE FUNCTION calculate_risk_with_decay(
    likelihood INT, 
    impact INT, 
    last_updated TIMESTAMP WITH TIME ZONE
) RETURNS FLOAT AS $$
DECLARE
    days_since_last_updated INT;
    decay_factor FLOAT;
BEGIN
    -- Calculate days since last update
    days_since_last_updated := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - last_updated));
    
    -- Calculate decay factor (reduces by 5% per day, minimum 0.1)
    decay_factor := GREATEST(0.1, 1 - (0.05 * days_since_last_updated));
    
    -- Return the risk score with decay applied
    RETURN (likelihood * impact * decay_factor)::FLOAT;
END;
$$ LANGUAGE plpgsql;

-- Function to get top threats based on risk score
CREATE OR REPLACE FUNCTION get_top_threats(limit_count INT DEFAULT 10) 
RETURNS TABLE (
    threat_id INT,
    threat_name VARCHAR(255),
    risk_score INT,
    affected_assets INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS threat_id,
        t.threat_name,
        MAX(tva.risk_score) AS risk_score,
        COUNT(DISTINCT tva.asset_id) AS affected_assets
    FROM 
        threats t
    JOIN 
        tva_mapping tva ON t.id = tva.threat_id
    GROUP BY 
        t.id, t.threat_name
    ORDER BY 
        risk_score DESC, affected_assets DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get assets at risk
CREATE OR REPLACE FUNCTION get_assets_at_risk(risk_threshold INT DEFAULT 15) 
RETURNS TABLE (
    asset_id INT,
    asset_name VARCHAR(255),
    asset_type VARCHAR(50),
    highest_risk_score INT,
    threat_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS asset_id,
        a.asset_name,
        a.asset_type,
        MAX(tva.risk_score) AS highest_risk_score,
        COUNT(DISTINCT tva.threat_id) AS threat_count
    FROM 
        assets a
    JOIN 
        tva_mapping tva ON a.id = tva.asset_id
    WHERE 
        tva.risk_score >= risk_threshold
    GROUP BY 
        a.id, a.asset_name, a.asset_type
    ORDER BY 
        highest_risk_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with 'updated_at' column
CREATE TRIGGER update_assets_modtime
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_threats_modtime
BEFORE UPDATE ON threats
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vulnerabilities_modtime
BEFORE UPDATE ON vulnerabilities
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_threat_data_modtime
BEFORE UPDATE ON threat_data
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Function to create alert when risk score exceeds threshold
CREATE OR REPLACE FUNCTION create_high_risk_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.risk_score > 20 THEN
        INSERT INTO alerts (alert_type, threat_id, risk_score, description)
        VALUES ('High Risk', NEW.threat_id, NEW.risk_score, 
                'High risk score detected for threat ID ' || NEW.threat_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to TVA mapping
CREATE TRIGGER tva_high_risk_alert
AFTER INSERT OR UPDATE ON tva_mapping
FOR EACH ROW EXECUTE FUNCTION create_high_risk_alert();


-- Create table for storing CBA analyses
CREATE TABLE IF NOT EXISTS cba_analyses (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER REFERENCES threats(id),
    asset_value NUMERIC NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    results JSONB NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cba_threat_id ON cba_analyses(threat_id);
CREATE INDEX IF NOT EXISTS idx_cba_analysis_date ON cba_analyses(analysis_date);