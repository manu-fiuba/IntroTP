-- =========================================================
-- DATOS REALES FÓRMULA 2
-- =========================================================

CREATE TABLE constructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    market_price DECIMAL(5,1) NOT NULL,
    total_points INT DEFAULT 0
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    constructor_id INT REFERENCES constructors(id) ON DELETE RESTRICT,
    market_price DECIMAL(5,1) NOT NULL,
    total_points INT DEFAULT 0
);

CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    season INT NOT NULL,
    round_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(4) NOT NULL,
    date TIMESTAMP NOT NULL,
    UNIQUE (season, round_number)
);

CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INT REFERENCES races(id) ON DELETE CASCADE,
    entity_id INT NOT NULL, -- ID del piloto o escudería (sin FK directa por ser polimórfico)
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('DRIVER', 'CONSTRUCTOR')),
    qualy_points INT DEFAULT 0,
    sprint_points INT DEFAULT 0,
    feature_points INT DEFAULT 0
);


-- =========================================================
-- USUARIOS Y LIGAS
-- =========================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_participants INT NOT NULL,
    join_code VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


-- =========================================================
-- FANTASY
-- =========================================================

CREATE TABLE fantasy_teams (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    budget_remaining DECIMAL(5,1) DEFAULT 100.0,
    total_points INT DEFAULT 0,
    free_transfers_remaining INT DEFAULT 2
);

CREATE TABLE fantasy_team_drivers (
    fantasy_team_id INT REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    driver_id INT REFERENCES drivers(id) ON DELETE RESTRICT,
    PRIMARY KEY (fantasy_team_id, driver_id)
);

CREATE TABLE fantasy_team_constructors (
    fantasy_team_id INT REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    constructor_id INT REFERENCES constructors(id) ON DELETE RESTRICT,
    PRIMARY KEY (fantasy_team_id, constructor_id)
);

CREATE TABLE league_members (
    league_id INT REFERENCES leagues(id) ON DELETE CASCADE,
    fantasy_team_id INT REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    PRIMARY KEY (league_id, fantasy_team_id)
);