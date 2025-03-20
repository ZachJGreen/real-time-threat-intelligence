CREATE TABLE tva_mapping (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE,
    vulnerability_id INT REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    likelihood INT CHECK (likelihood BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    risk_score INT GENERATED ALWAYS AS (likelihood * impact) STORED,
    UNIQUE (asset_id, threat_id, vulnerability_id)
);

-- Not sure if I should just these insert statements into another file
-- but the following statements all threat-vulnerability pairs to the TVA table (Task 2)
/*
-- add assets
INSERT INTO assets (asset_name, asset_type, description) VALUES
    ('Server', 'Hardware', 'Hosts website and customer data'),
    ('Network Router', 'Hardware', 'Connects employee workstations to the internet'),
    ('Inventory Management System', 'Software', 'Keeps track of ShopSmart inventory'),
    ('MySQL', 'Software', 'Software', 'Stores all application data'),
    ('Customer Information', 'Data', 'Includes name, address, and payment details'),
    ('IT Manager', 'People', 'Maintains IT infrastructure and updates inventory'),
    ('Payments through payment gateway', 'Process', 'Handles customer payments through a third-party payment gateway');


-- add threats
INSERT INTO threats (asset_id, threat_name) VALUES
    (1, 'DDoS Attack'), 
    (2, 'Man-in-the-Middle Attack'),  
    (3, 'SQL Injection'), 
    (4, 'Database Breach'), 
    (5, 'Phishing Attack'), 
    (6, 'Insider Threat'), 
    (7, 'Payment Fraud'); 

-- add vulnerabilities
INSERT INTO vulnerabilities (asset_id, vulnerability_name) VALUES
    (1, 'Unpatched Software'), 
    (2, 'Weak Encryption'), 
    (3, 'Unvalidated Input'), 
    (4, 'Weak Credentials'), 
    (5, 'Data Exposure via Email Phishing'), 
    (6, 'Excessive Privileges'), 
    (7, 'Lack of Transaction Verification');

-- link threats to vulnerabilities and assigns likelihood/impact values
INSERT INTO tva_mapping (asset_id, threat_id, vulnerability_id, likelihood, impact) VALUES
    (1, 1, 1, 4, 5),
    (2, 2, 2, 3, 4), 
    (3, 3, 3, 5, 5),
    (4, 4, 4, 4, 5),
    (5, 5, 5, 3, 4),
    (6, 6, 6, 2, 5), 
    (7, 7, 7, 4, 4);

 */



