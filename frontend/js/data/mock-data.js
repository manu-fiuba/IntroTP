// js/data/mock-data.js

/**
 * Objeto global que simula nuestra base de datos PostgreSQL.
 * Contiene la estructura inicial basada en init.sql
 */
const mockDatabase = {
    // Tabla: constructors
    constructors: [
        { id: 1, name: "Campos Racing", market_price: 15.5, total_points: 45 },
        { id: 2, name: "Prema Racing", market_price: 18.0, total_points: 60 }
    ],

    // Tabla: drivers
    drivers: [
        { id: 1, number: 10, name: "Franco Colapinto", constructor_id: 1, market_price: 8.5, total_points: 30 },
        { id: 2, number: 3, name: "Ollie Bearman", constructor_id: 2, market_price: 9.0, total_points: 35 },
        { id: 3, number: 4, name: "Kimi Antonelli", constructor_id: 2, market_price: 9.5, total_points: 25 }
    ],

    // Tabla: users
    users: [
        { id: 1, username: "usuario_demo", first_name: "Juan", last_name: "Pérez" }
    ],

    // Tabla: leagues
    leagues: [
        { id: 1, owner_id: 1, name: "Liga Global F2", description: "La liga oficial para todos", max_participants: 200, join_code: "F2-GLOBAL" }
    ],

    // Tabla: fantasy_teams
    fantasyTeams: [
        { 
            id: 1, 
            user_id: 1, 
            name: "Los Pisteros", 
            budget_remaining: 100.0, // Presupuesto inicial por defecto
            total_points: 0, 
            free_transfers_remaining: 2, // Transferencias por defecto
            
            // Relaciones simuladas (tablas fantasy_team_drivers y fantasy_team_constructors)
            selected_drivers: [], 
            selected_constructor: null
        }
    ]
};

// Exportamos el objeto si usás módulos de ES6, 
// o simplemente lo dejamos disponible de forma global si lo vinculás directo en el HTML.