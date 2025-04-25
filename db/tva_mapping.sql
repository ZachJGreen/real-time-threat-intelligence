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


-- Sample data
INSERT INTO assets (asset_name, asset_type, description) VALUES
    ('Server', 'Hardware', 'Hosts website and customer data'),
    ('Workstations', 'Hardware', 'Used by employees to complete work'),
    ('Network Router', 'Hardware', 'Connects employee workstations to the internet'),
    ('Firewall', 'Hardware', 'Serves as a security barrier between the company network and the internet'),
    ('Switch', 'Hardware', 'Connects workstations and database server'),
    ('Inventory Management System', 'Software', 'Keeps track of ShopSmart inventory'),
    ('CMS', 'Software', 'Allows employees to create, manage, and publish content to the web'),
    ('Anti-Virus Software', 'Software', 'Protects devices from malware'),
    ('MySQL', 'Software', 'Stores all application data'),
    ('Customer Information', 'Data', 'Includes name, address, and payment details'),
    ('Product Inventory', 'Data', 'Available products and their relevant information'),
    ('Sales Records', 'Data', 'Tracks transaction history of customer'),
    ('Employee Information', 'Data', 'Personal information about employees of ShopSmart'),
    ('Business Owner', 'People', 'Oversees operations and decision-making of ShopSmart'),
    ('Customer Support Representatives', 'People', ' Interact with customers to answer questions'),
    ('IT Manager', 'People', 'Maintains IT infrastructure and updates inventory'),
    ('Salesperson', 'People', 'Sells products to customers'),
    ('Customer orders through website', 'Process', 'Orders are submitted and processed online'),
    ('Payments through payment gateway', 'Process', 'Handles customer payments through a third-party payment gateway'),
    ('Updating inventory', 'Process', 'IT manager ensures inventory records are accurate');


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
    



