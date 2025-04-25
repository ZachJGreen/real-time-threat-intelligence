-- Sample data for testing

INSERT INTO assets (asset_name, asset_type, description, criticality, owner) VALUES
('Production Web Server', 'Hardware', 'Main web server hosting ShopSmart e-commerce platform', 5, 'IT Operations'),
('Customer Database', 'Data', 'PostgreSQL database containing customer information', 5, 'Data Team'),
('Payment Processing API', 'Software', 'API handling credit card transactions', 5, 'DevOps Team'),
('Admin Dashboard', 'Software', 'Internal management dashboard', 4, 'IT Operations'),
('Network Firewall', 'Hardware', 'Perimeter firewall protecting internal network', 5, 'Security Team'),
('Customer Support Team', 'People', 'Team handling customer inquiries and issues', 3, 'Customer Relations'),
('Backup System', 'Process', 'Daily backup process for all databases', 4, 'IT Operations'),
('Load Balancer', 'Hardware', 'Distributes incoming traffic across multiple servers', 4, 'IT Operations'),
('Authentication Service', 'Software', 'Handles user authentication and session management', 5, 'Security Team'),
('Inventory Management System', 'Software', 'Tracks product inventory', 4, 'Operations Team');

-- Sample data for threats
INSERT INTO threats (threat_name, threat_type, description) VALUES
('SQL Injection', 'Web Application', 'Attacker injects malicious SQL code via input fields'),
('Cross-Site Scripting (XSS)', 'Web Application', 'Attacker injects malicious scripts into web pages'),
('Phishing', 'Social Engineering', 'Deceptive attempts to steal user credentials or personal information'),
('DDoS Attack', 'Network', 'Overwhelming a system with traffic to make it unavailable'),
('Ransomware', 'Malware', 'Malicious software that encrypts files and demands payment'),
('Brute Force Attack', 'Authentication', 'Attempting to gain access by trying many passwords'),
('Man-in-the-Middle', 'Network', 'Intercepting communications between two parties'),
('Insider Threat', 'Personnel', 'Malicious actions by employees or contractors'),
('Zero-Day Exploit', 'Vulnerability', 'Attack exploiting unknown vulnerabilities'),
('Data Breach', 'Data Security', 'Unauthorized access to sensitive data');

-- Sample data for vulnerabilities
INSERT INTO vulnerabilities (vulnerability_name, description, cve_id, severity) VALUES
('Unpatched Web Server', 'Server running outdated version with known vulnerabilities', 'CVE-2023-1234', 8),
('Weak Password Policy', 'System allows simple passwords and no MFA', NULL, 7),
('Insecure API Endpoints', 'API endpoints without proper authentication', NULL, 9),
('SQL Injection Vulnerability', 'Input validation failures allowing SQL injection', 'CVE-2023-5678', 10),
('Unencrypted Data Transfer', 'Data being transferred without encryption', NULL, 8),
('Outdated SSL Certificates', 'Expired or weak SSL certificates', NULL, 6),
('Open Ports', 'Unnecessary ports open on production servers', NULL, 7),
('Unpatched Software', 'Third-party software not updated regularly', 'CVE-2023-9012', 8),
('Misconfigured CORS', 'Cross-Origin Resource Sharing misconfiguration', NULL, 6),
('Default Credentials', 'Systems using default or widely known credentials', NULL, 9);

-- Sample TVA Mappings
INSERT INTO tva_mapping (asset_id, threat_id, vulnerability_id, likelihood, impact) VALUES
(1, 1, 4, 4, 5), -- Web Server vulnerable to SQL Injection
(2, 1, 4, 4, 5), -- Customer Database vulnerable to SQL Injection
(3, 7, 5, 3, 5), -- Payment API vulnerable to Man-in-the-Middle
(4, 2, 9, 3, 4), -- Admin Dashboard vulnerable to XSS due to CORS
(5, 4, 7, 2, 5), -- Network Firewall with open ports vulnerable to DDoS
(9, 6, 2, 4, 5), -- Authentication Service with weak password policy
(1, 9, 8, 2, 5), -- Web Server vulnerable to Zero-Day via unpatched software
(8, 4, 7, 3, 4), -- Load Balancer with open ports vulnerable to DDoS
(10, 1, 4, 3, 3), -- Inventory System vulnerable to SQL Injection
(3, 10, 5, 3, 5); -- Payment API vulnerable to Data Breach via unencrypted transfer

-- Sample Shodan data - This would normally come from the API
INSERT INTO threat_data (ip_address, ports, services, hostnames, vulns, raw_data) VALUES
('203.0.113.1', '[80, 443, 22]', '{"80": "http", "443": "https", "22": "ssh"}', '["webserver1.shopsmart.com"]', '{"CVE-2023-1234": {"cvss": 8.5, "summary": "Remote code execution vulnerability"}}', '{"ip": "203.0.113.1", "ports": [80, 443, 22], "hostnames": ["webserver1.shopsmart.com"], "country_name": "United States"}'),
('203.0.113.2', '[80, 443, 3306]', '{"80": "http", "443": "https", "3306": "mysql"}', '["dbserver.shopsmart.com"]', '{"CVE-2023-5678": {"cvss": 7.5, "summary": "SQL injection vulnerability"}}', '{"ip": "203.0.113.2", "ports": [80, 443, 3306], "hostnames": ["dbserver.shopsmart.com"], "country_name": "United States"}');

-- Sample alerts
INSERT INTO alerts (alert_type, threat_id, risk_score, description, status) VALUES
('High Risk', 1, 20, 'SQL Injection vulnerability detected on production web server', 'Open'),
('Critical', 4, 25, 'Potential DDoS attack detected on network firewall', 'Acknowledged'),
('Medium Risk', 2, 12, 'XSS vulnerability detected in admin dashboard', 'Resolved');

-- Sample incident logs
INSERT INTO incident_logs (alert_id, response_plan, action_taken, responder) VALUES
(1, '1. Block the attacking IP. 2. Patch the vulnerability. 3. Conduct forensic analysis.', 'Applied Web Application Firewall rule to block attack pattern', 'Security Team'),
(2, '1. Activate DDoS mitigation. 2. Enable rate limiting. 3. Monitor traffic.', 'Enabled CloudFlare DDoS protection and rate limiting', 'Network Operations');