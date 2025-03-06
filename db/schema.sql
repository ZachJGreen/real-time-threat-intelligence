CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    threat_name VARCHAR(255) NOT NULL,
    risk_level INT CHECK (risk_level BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    vulnerability_name VARCHAR(255) NOT NULL,
    description TEXT,
    severity INT CHECK (severity BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_ratings (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE,
    vulnerability_id INT REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    likelihood INT CHECK (likelihood BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    risk_score INT GENERATED ALWAYS AS (likelihood * impact) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
=======
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    description TEXT
);

CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    threat_name VARCHAR(255),
    risk_level INT CHECK (risk_level BETWEEN 1 AND 10)
);

CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    vulnerability_name VARCHAR(255),
    severity INT CHECK (severity BETWEEN 1 AND 10)
);

CREATE TABLE risk_ratings (
    id SERIAL PRIMARY KEY,
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE,
    likelihood INT CHECK (likelihood BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    risk_score INT GENERATED ALWAYS AS (likelihood * impact) STORED
);

