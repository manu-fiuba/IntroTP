/**
 * BASE DE DATOS SIMULADA (MOCK)
 * ------------------------------------------------------------------
 * Estructura calcada 1 a 1 a las tablas de backend/scripts/init.sql
 * (mismos nombres de columna, en snake_case) para que reemplazar el
 * mock por el backend real (cuando esté disponible) sea un cambio de
 * una sola línea en api.js, no una reescritura del frontend.
 *
 * Esto NO tiene lógica de negocio — eso vive en api.js, imitando lo
 * que hoy hacen los controllers de backend/src/controllers/.
 */

const MOCK_DB = {

    // Tabla: users
    // (password acá es texto plano SOLO para el mock; el backend real
    // guarda password_hash con bcrypt — esto se descarta al conectar)
    users: [
        { id: 1, username: "usuario_demo", password: "demo1234", first_name: "Nombre", last_name: "Apellido" },
        { id: 2, username: "mfernandez",   password: "demo1234", first_name: "Matías",  last_name: "Fernandez" },
        { id: 3, username: "jperez",       password: "demo1234", first_name: "Juan",    last_name: "Pérez" },
        { id: 4, username: "lgomez",       password: "demo1234", first_name: "Lucas",   last_name: "Gómez" }
    ],

    // Tabla: constructors
    constructors: [
        { id: 1, name: "Campos Racing",  market_price: 15.5, total_points: 45 },
        { id: 2, name: "Prema Racing",   market_price: 18.0, total_points: 60 },
        { id: 3, name: "ART Grand Prix", market_price: 11.0, total_points: 20 }
    ],

    // Tabla: drivers
    drivers: [
        { id: 1, number: 10, name: "Franco Colapinto", constructor_id: 1, market_price: 8.5, total_points: 30 },
        { id: 2, number: 3,  name: "Ollie Bearman",     constructor_id: 2, market_price: 9.0, total_points: 35 },
        { id: 3, number: 4,  name: "Kimi Antonelli",    constructor_id: 2, market_price: 9.5, total_points: 25 },
        { id: 4, number: 20, name: "Isack Hadjar",      constructor_id: 1, market_price: 6.0, total_points: 15 },
        { id: 5, number: 21, name: "Pepe Martí",        constructor_id: 1, market_price: 5.0, total_points: 10 },
        { id: 6, number: 1,  name: "Victor Martins",    constructor_id: 3, market_price: 6.5, total_points: 18 },
        { id: 7, number: 2,  name: "Zak O'Sullivan",    constructor_id: 3, market_price: 5.5, total_points: 12 }
    ],

    // Tabla: fantasy_teams
    // (el UNIQUE en user_id se va a sacar de la base real — un usuario
    // puede tener varios equipos, hasta 3 según el diseño de home.html)
    fantasy_teams: [
        { id: 1, user_id: 1, name: "Mi equipo",          budget_remaining: 28.5, total_points: 1796, free_transfers_remaining: 2, driver_ids: [1, 2, 3, 4, 5], constructor_ids: [1, 2] },
        { id: 2, user_id: 1, name: "Escudería Huevo",     budget_remaining: 100.0, total_points: 1250, free_transfers_remaining: 2, driver_ids: [], constructor_ids: [] },
        { id: 3, user_id: 2, name: "Corsa Power",         budget_remaining: 88.0, total_points: 1340, free_transfers_remaining: 1, driver_ids: [6, 7], constructor_ids: [3] },
        { id: 4, user_id: 3, name: "Escudería Pistera",   budget_remaining: 100.0, total_points: 1120, free_transfers_remaining: 2, driver_ids: [], constructor_ids: [] },
        { id: 5, user_id: 4, name: "Frenada Larga",       budget_remaining: 100.0, total_points: 980,  free_transfers_remaining: 2, driver_ids: [], constructor_ids: [] }
    ],

    // Tabla: races
    races: [
        { id: 1, season: 2026, round_number: 9,  name: "Hungría", country_code: "HUN", date: "2026-07-26T13:00:00Z" },
        { id: 2, season: 2026, round_number: 10, name: "Italia",  country_code: "ITA", date: "2026-09-06T13:00:00Z" }
    ],

    // ⚠️ ESTO NO ES UNA TABLA REAL. No existe ningún endpoint hoy que
    // devuelva "puntos de tu equipo en tal carrera" ni "tu mejor semana".
    // Lo pongo acá como mock hasta que el backend tenga algo como
    // GET /api/teams/:id/race-history — hace falta para las secciones
    // "Última carrera" y "Mejor semana" de home.html.
    team_race_history: {
        1: { lastRace: { raceId: 1, points: 232 }, bestWeek: { raceId: 1, raceName: "Hungría", dateLabel: "25 - 26 Jul", points: 232 } },
        2: { lastRace: { raceId: 1, points: 173 }, bestWeek: { raceId: 2, raceName: "Arabia Saudita", dateLabel: "14 - 15 Mar", points: 294 } },
        3: { lastRace: { raceId: 1, points: 210 }, bestWeek: { raceId: 1, raceName: "Hungría", dateLabel: "25 - 26 Jul", points: 210 } },
        4: { lastRace: { raceId: 1, points: 140 }, bestWeek: { raceId: 1, raceName: "Hungría", dateLabel: "25 - 26 Jul", points: 140 } },
        5: { lastRace: { raceId: 1, points: 90 },  bestWeek: { raceId: 1, raceName: "Hungría", dateLabel: "25 - 26 Jul", points: 90 } }
    },

    // Tabla: leagues
    // (password acá es texto plano solo para el mock, igual que en users)
    leagues: [
        { id: 1, owner_id: 1, name: "Amigos de la Facu",       description: "El que pierde a fin de año paga el asado. Solo cuentas principales.", max_participants: 12,    join_code: "X89B26",   password: "amigos123" },
        { id: 2, owner_id: 1, name: "F2 Global Championship",  description: "Liga oficial abierta para todos los jugadores del mundo.",             max_participants: 15000, join_code: "F2GLOBAL", password: "global123" }
    ],

    // Tabla: league_members
    league_members: [
        { league_id: 1, fantasy_team_id: 2 }, // "Tu equipo" (Escudería Huevo) — 1250 pts
        { league_id: 1, fantasy_team_id: 3 }, // Corsa Power — 1340 pts
        { league_id: 1, fantasy_team_id: 4 }, // Escudería Pistera — 1120 pts
        { league_id: 1, fantasy_team_id: 5 }  // Frenada Larga — 980 pts
    ],

    // Contadores para simular SERIAL PRIMARY KEY al insertar
    nextIds: { users: 5, fantasy_teams: 6, leagues: 3 }
};