-- /db/tva_update.sql

-- Elevate likelihood for any mapped threat that appears in high-risk OSINT data
UPDATE tva_mapping
SET likelihood = 5
WHERE threat_id IN (
    SELECT t.id
    FROM threats t
             JOIN threat_data td ON td.threat_type = t.threat_name
    WHERE td.risk_score > 20
);

-- Boost impact if the associated asset is critical
UPDATE tva_mapping
SET impact = 5
WHERE asset_id IN (
    SELECT id FROM assets WHERE criticality >= 4
);
