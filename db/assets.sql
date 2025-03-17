CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN ('Hardware', 
    'Software', 'Data', 'People', 'Process')),
    description TEXT
);
