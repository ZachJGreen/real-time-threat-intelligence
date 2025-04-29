-- Create additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tva_last_updated ON tva_mapping(last_updated);
CREATE INDEX IF NOT EXISTS idx_threat_data_last_scan ON threat_data(last_scan);
CREATE INDEX IF NOT EXISTS idx_vulnerability_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Add partial index for high-risk threats (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_high_risk_threats ON tva_mapping(risk_score)
WHERE risk_score > 15;

-- Add partial index for active alerts
CREATE INDEX IF NOT EXISTS idx_active_alerts ON alerts(status)
WHERE status IN ('Open', 'Acknowledged');

-- Optimize TVA queries with materialized view for dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_high_risk_threats AS
SELECT 
    t.id AS threat_id,
    t.threat_name,
    t.threat_type,
    a.id AS asset_id,
    a.asset_name,
    a.asset_type,
    v.id AS vulnerability_id,
    v.vulnerability_name,
    v.cve_id,
    tva.likelihood,
    tva.impact,
    tva.risk_score,
    tva.last_updated
FROM 
    tva_mapping tva
JOIN 
    threats t ON tva.threat_id = t.id
JOIN 
    assets a ON tva.asset_id = a.id
JOIN 
    vulnerabilities v ON tva.vulnerability_id = v.id
WHERE 
    tva.risk_score > 15
ORDER BY 
    tva.risk_score DESC;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_mv_high_risk_threats ON mv_high_risk_threats(risk_score, threat_id);

-- Add refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_high_risk_threats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_high_risk_threats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically refresh the materialized view
CREATE TRIGGER refresh_high_risk_threats_trigger
AFTER INSERT OR UPDATE ON tva_mapping
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_high_risk_threats();

-- Optimized function for getting top threats with improved performance
CREATE OR REPLACE FUNCTION get_top_threats_optimized(limit_count INT DEFAULT 10) 
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
        MAX(tva.risk_score) DESC, 
        COUNT(DISTINCT tva.asset_id) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Optimized query for dashboard data (reduces joins)
CREATE OR REPLACE FUNCTION get_dashboard_summary() 
RETURNS TABLE (
    high_risk_count BIGINT,
    medium_risk_count BIGINT,
    low_risk_count BIGINT,
    affected_assets_count BIGINT,
    total_threats BIGINT,
    avg_risk_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM tva_mapping WHERE risk_score >= 15) AS high_risk_count,
        (SELECT COUNT(*) FROM tva_mapping WHERE risk_score >= 8 AND risk_score < 15) AS medium_risk_count,
        (SELECT COUNT(*) FROM tva_mapping WHERE risk_score < 8) AS low_risk_count,
        (SELECT COUNT(DISTINCT asset_id) FROM tva_mapping) AS affected_assets_count,
        (SELECT COUNT(*) FROM threats) AS total_threats,
        (SELECT COALESCE(AVG(risk_score), 0) FROM tva_mapping) AS avg_risk_score;
END;
$$ LANGUAGE plpgsql;

-- Optimized query for threat trend analysis (time-series data)
CREATE OR REPLACE FUNCTION get_threat_trends(days_back INT DEFAULT 30) 
RETURNS TABLE (
    date_point DATE,
    high_risk_count BIGINT,
    medium_risk_count BIGINT,
    low_risk_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_back || ' days')::INTERVAL, 
            CURRENT_DATE, 
            '1 day'::INTERVAL
        )::DATE AS date_point
    )
    SELECT 
        d.date_point,
        COUNT(DISTINCT CASE WHEN a.risk_score >= 15 THEN a.id END) AS high_risk_count,
        COUNT(DISTINCT CASE WHEN a.risk_score >= 8 AND a.risk_score < 15 THEN a.id END) AS medium_risk_count,
        COUNT(DISTINCT CASE WHEN a.risk_score < 8 THEN a.id END) AS low_risk_count
    FROM 
        date_series d
    LEFT JOIN 
        alerts a ON DATE(a.created_at) = d.date_point
    GROUP BY 
        d.date_point
    ORDER BY 
        d.date_point;
END;
$$ LANGUAGE plpgsql;

-- Optimized query for asset risk assessment
CREATE OR REPLACE FUNCTION get_asset_risk_profile(p_asset_id INT) 
RETURNS TABLE (
    asset_id INT,
    asset_name VARCHAR(255),
    high_risks BIGINT,
    medium_risks BIGINT,
    low_risks BIGINT,
    top_threat VARCHAR(255),
    max_risk_score INT
) AS $$
BEGIN
    RETURN QUERY
    WITH risk_counts AS (
        SELECT
            COUNT(CASE WHEN tva.risk_score >= 15 THEN 1 END) AS high_risks,
            COUNT(CASE WHEN tva.risk_score >= 8 AND tva.risk_score < 15 THEN 1 END) AS medium_risks,
            COUNT(CASE WHEN tva.risk_score < 8 THEN 1 END) AS low_risks
        FROM
            tva_mapping tva
        WHERE
            tva.asset_id = p_asset_id
    ),
    top_threat_data AS (
        SELECT
            t.threat_name,
            tva.risk_score
        FROM
            tva_mapping tva
        JOIN
            threats t ON tva.threat_id = t.id
        WHERE
            tva.asset_id = p_asset_id
        ORDER BY
            tva.risk_score DESC
        LIMIT 1
    )
    SELECT
        a.id AS asset_id,
        a.asset_name,
        rc.high_risks,
        rc.medium_risks,
        rc.low_risks,
        COALESCE(tt.threat_name, 'No threats') AS top_threat,
        COALESCE(tt.risk_score, 0) AS max_risk_score
    FROM
        assets a
    CROSS JOIN
        risk_counts rc
    LEFT JOIN
        top_threat_data tt ON true
    WHERE
        a.id = p_asset_id;
END;
$$ LANGUAGE plpgsql;

-- Optimize API cache queries
CREATE OR REPLACE FUNCTION get_valid_cache(p_api_type VARCHAR, p_query_key VARCHAR)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT response INTO v_result
    FROM api_cache
    WHERE api_type = p_api_type
      AND query_key = p_query_key
      AND expires_at > CURRENT_TIMESTAMP;
      
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to purge expired cache entries (run periodically)
CREATE OR REPLACE FUNCTION purge_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM api_cache
    WHERE expires_at < CURRENT_TIMESTAMP
    RETURNING COUNT(*) INTO v_deleted_count;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add vacuum analyze statements for database statistics optimization
ANALYZE assets;
ANALYZE threats;
ANALYZE vulnerabilities;
ANALYZE tva_mapping;
ANALYZE threat_data;
ANALYZE alerts;
ANALYZE incident_logs;
ANALYZE api_cache;

-- Create stored procedure to regularly optimize the database
CREATE OR REPLACE PROCEDURE maintenance_optimize()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_high_risk_threats;
    
    -- Remove expired cache
    PERFORM purge_expired_cache();
    
    -- Update statistics
    ANALYZE assets;
    ANALYZE threats;
    ANALYZE vulnerabilities;
    ANALYZE tva_mapping;
    ANALYZE threat_data;
    ANALYZE alerts;
    ANALYZE incident_logs;
    ANALYZE api_cache;
    
    -- Log maintenance completion
    INSERT INTO maintenance_log (maintenance_type, completed_at)
    VALUES ('Database Optimization', CURRENT_TIMESTAMP);
END;
$$;

-- Create maintenance log table if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_log (
    id SERIAL PRIMARY KEY,
    maintenance_type VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    details TEXT
);