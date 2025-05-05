-- Create a table for storing security log entries for persistence and analysis
CREATE TABLE IF NOT EXISTS security_logs (
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_log_type ON security_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_score ON security_logs(risk_score);

-- Create a database function to purge old logs (keeps the table from growing too large)
CREATE OR REPLACE FUNCTION purge_old_security_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_logs
    WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for high-risk threat events for easier dashboard queries
CREATE OR REPLACE VIEW high_risk_security_events AS
SELECT *
FROM security_logs
WHERE severity IN ('HIGH', 'CRITICAL')
  AND created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY created_at DESC;