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


