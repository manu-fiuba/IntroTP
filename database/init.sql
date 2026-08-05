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
    role VARCHAR(20) DEFAULT 'user',
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
    password_hash VARCHAR(255)
);


-- =========================================================
-- FANTASY
-- =========================================================

CREATE TABLE fantasy_teams (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
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

-- =========================================================
-- DATOS INICIALES FÓRMULA 2 - TEMPORADA 2026
-- =========================================================

-- 1. ESCUDERÍAS (Constructors)
-- Se asignan precios de mercado iniciales balanceados para el juego
INSERT INTO constructors (id, name, market_price, total_points) VALUES
(1, 'Invicta Racing', 17.5, 0),
(2, 'Hitech', 14.0, 0),
(3, 'Campos Racing', 16.5, 0),
(4, 'DAMS Lucas Oil', 13.5, 0),
(5, 'MP Motorsport', 15.0, 0),
(6, 'PREMA Racing', 18.0, 0),
(7, 'Rodin Motorsport', 14.5, 0),
(8, 'ART Grand Prix', 16.0, 0),
(9, 'AIX Racing', 8.5, 0),
(10, 'Van Amersfoort Racing', 10.0, 0),
(11, 'TRIDENT', 9.5, 0);

-- Reiniciar la secuencia para futuros inserts manuales
SELECT setval('constructors_id_seq', (SELECT MAX(id) FROM constructors));


-- 2. PILOTOS (Drivers)
-- Relacionados con su respectivo constructor_id
INSERT INTO drivers (number, name, constructor_id, market_price, total_points) VALUES
(1, 'Rafael Câmara', 1, 16.0, 0),
(2, 'Joshua Dürksen', 1, 14.5, 0),
(3, 'Ritomo Miyata', 2, 13.5, 0),
(4, 'Colton Herta', 2, 15.0, 0),
(5, 'Noel Leon', 3, 14.0, 0),
(6, 'Nikola Tsolov', 3, 13.0, 0),
(7, 'Dino Beganovic', 4, 12.5, 0),
(8, 'Roman Bilinski', 4, 11.5, 0),
(9, 'Gabriele Mini', 5, 15.5, 0),
(10, 'Oliver Goethe', 5, 14.0, 0),
(11, 'Sebastian Montoya', 6, 16.5, 0),
(12, 'Mari Boya', 6, 15.0, 0),
(14, 'Martinius Stenshorne', 7, 13.5, 0),
(15, 'Alexander Dunne', 7, 12.0, 0),
(16, 'Kush Maini', 8, 14.5, 0),
(17, 'Tasanapol Inthraphuvasak', 8, 11.0, 0),
(20, 'Emerson Fittipaldi', 9, 8.5, 0),
(21, 'Cian Shields', 9, 7.5, 0),
(22, 'Nico Varrone', 10, 10.5, 0),
(23, 'Rafael Villagomez', 10, 9.0, 0),
(24, 'Laurens van Hoepen', 11, 10.0, 0),
(25, 'John Bennett', 11, 8.0, 0);


-- 3. CALENDARIO DE CARRERAS (Races) - Temporada 2026
-- 14 Rondas siguiendo el estándar de F2 (Fechas ajustadas a fines de semana 2026)
INSERT INTO races (season, round_number, name, country_code, date) VALUES
(2026, 1, 'Bahrain Grand Prix', 'BHR', '2026-03-01 13:30:00'),
(2026, 2, 'Saudi Arabian Grand Prix', 'SAU', '2026-03-15 13:30:00'),
(2026, 3, 'Australian Grand Prix', 'AUS', '2026-04-05 11:35:00'),
(2026, 4, 'Emilia Romagna Grand Prix', 'ITA', '2026-05-17 10:00:00'),
(2026, 5, 'Monaco Grand Prix', 'MCO', '2026-05-24 09:40:00'),
(2026, 6, 'Spanish Grand Prix', 'ESP', '2026-06-21 11:30:00'),
(2026, 7, 'Austrian Grand Prix', 'AUT', '2026-07-05 10:00:00'),
(2026, 8, 'British Grand Prix', 'GBR', '2026-07-12 10:05:00'),
(2026, 9, 'Belgian Grand Prix', 'BEL', '2026-07-26 10:00:00'),
(2026, 10, 'Hungarian Grand Prix', 'HUN', '2026-08-02 10:05:00'),
(2026, 11, 'Italian Grand Prix', 'ITA', '2026-09-06 10:05:00'),
(2026, 12, 'Azerbaijan Grand Prix', 'AZE', '2026-09-20 11:35:00'),
(2026, 13, 'Qatar Grand Prix', 'QAT', '2026-11-29 14:20:00'),
(2026, 14, 'Abu Dhabi Grand Prix', 'UAE', '2026-12-06 13:15:00');
