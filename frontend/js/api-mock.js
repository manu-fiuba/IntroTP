// js/api.js

/**
 * Función auxiliar para simular el tiempo que tarda la red (latencia).
 * Retorna una Promise que se resuelve después de 'ms' milisegundos.
 */
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Objeto 'api' que agrupa todas las llamadas a nuestro backend.
 * Cuando el backend esté listo, solo hay que cambiar el contenido de estas funciones
 * por un 'fetch()' real y borrar la referencia a 'mockDatabase'.
 */
const api = {
    
    // ==========================================
    // LIGAS
    // ==========================================

    // Obtener todas las ligas
    getLeagues: async () => {
        await delay(); // Simulamos 500ms de carga
        return {
            status: 'success',
            data: [...mockDatabase.leagues] // Devolvemos una copia del array del mock
        };
    },

    // Crear una liga nueva
    createLeague: async (leagueData) => {
        await delay(800); // Simulamos que procesar la creación tarda un poco más
        
        // Creamos el nuevo objeto simulando lo que haría la base de datos
        const newLeague = {
            id: mockDatabase.leagues.length + 1,
            owner_id: 1, // Asumimos que es el usuario demo logueado
            join_code: "F2-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            ...leagueData
        };

        // Lo guardamos en nuestra base de datos falsa para que persista
        // mientras no recarguemos la pestaña del navegador.
        mockDatabase.leagues.push(newLeague);

        return {
            status: 'success',
            message: 'Liga creada exitosamente',
            data: newLeague
        };
    },
    
    // ==========================================
    // MERCADO Y EQUIPOS
    // ==========================================

    // Obtener todas las opciones del mercado (Pilotos y Escuderías)
    getMarketOptions: async () => {
        await delay(500); // Simulamos latencia de red
        return {
            status: 'success',
            data: {
                drivers: [...mockDatabase.drivers],
                constructors: [...mockDatabase.constructors]
            }
        };
    },

    // Guardar el equipo creado
    createTeam: async (teamData) => {
        await delay(800);
        
        // Asumiendo que el usuario es el 1 y tiene $100.0M por defecto según init.sql
        const newTeam = {
            id: mockDatabase.fantasyTeams.length + 1,
            user_id: 1, 
            name: teamData.name || "Mi Equipo",
            budget_remaining: teamData.budget,
            total_points: 0,
            free_transfers_remaining: 2,
            selected_drivers: teamData.drivers,
            selected_constructors: teamData.constructors
        };

        mockDatabase.fantasyTeams.push(newTeam);

        return {
            status: 'success',
            message: 'Equipo guardado con éxito',
            data: newTeam
        };
    },

    // Obtener los equipos del usuario
    getUserTeams: async () => {
        await delay(400); // Simulamos carga
        return {
            status: 'success',
            // Por ahora devolvemos todos los equipos creados en la base de datos
            data: [...mockDatabase.fantasyTeams] 
        };
    },

    // Unirse a una liga existente
    joinLeague: async (joinData) => {
        await delay(600); // Simulamos el procesamiento en el servidor
        return {
            status: 'success',
            message: '¡Te has unido a la liga con éxito!'
        };
    },

    // Obtener el detalle de una liga específica
    getLeagueDetails: async (leagueId) => {
        await delay(500); // Simular red
        return {
            status: 'success',
            data: {
                id: leagueId,
                name: 'Amigos de la Facu',
                description: 'El que pierde a fin de año paga el asado. Solo cuentas principales.',
                adminName: 'Tato Fernandez',
                userTeamName: 'Escudería Huevo',
                inviteCode: 'X89B-2026',
                userPosition: '2°',
                leaderboard: [
                    { position: 1, userName: 'Matías Fernandez', teamName: 'Corsa Power', points: 1340, isCurrentUser: false },
                    { position: 2, userName: 'Tu Nombre', teamName: 'Escudería Huevo', points: 1250, isCurrentUser: true },
                    { position: 3, userName: 'Juan Pérez', teamName: 'Escudería Pistera', points: 1120, isCurrentUser: false },
                    { position: 4, userName: 'Lucas Gómez', teamName: 'Frenada Larga', points: 980, isCurrentUser: false }
                ]
            }
        };
    },

    // Abandonar una liga
    leaveLeague: async (leagueId) => {
        await delay(600);
        return {
            status: 'success',
            message: 'Has abandonado la liga correctamente.'
        };
    },

    // Obtener la lista de ligas del usuario
    getUserLeagues: async () => {
        await delay(400); // Simulamos el tiempo de red
        return {
            status: 'success',
            data: [
                {
                    id: '1',
                    name: 'Amigos de la Facu',
                    description: 'El que pierde a fin de año paga el asado. Solo cuentas principales.',
                    position: 2,
                    totalParticipants: 12,
                    userTeamName: 'Mi Equipo'
                },
                {
                    id: '2',
                    name: 'F2 Global Championship',
                    description: 'Liga oficial abierta para todos los jugadores del mundo.',
                    position: 458,
                    totalParticipants: 15000,
                    userTeamName: 'Escudería Huevo'
                }
            ]
        };
    }
};