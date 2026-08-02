// js/api-mock.js

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
    
    // ==========================================
    // AUTH / LOGIN
    // ==========================================
    login: async (credentials) => {
        await delay(800);
        return {
            status: 'success',
            data: {
                user: { username: credentials.username, name: 'Piloto Destacado' },
                token: 'mock-jwt-token-987654321'
            },
            message: 'Sesión iniciada correctamente'
        };
    },

    // ==========================================
    // LIGAS
    // ==========================================
    getLeagues: async () => {
        await delay();
        return { status: 'success', data: [...mockDatabase.leagues] };
    },

    getUserLeagues: async () => {
        await delay(400);
        return {
            status: 'success',
            data: [
                { id: '1', name: 'Amigos de la Facu', description: 'El que pierde a fin de año paga el asado.', position: 2, totalParticipants: 12, userTeamName: 'Mi Equipo' },
                { id: '2', name: 'F2 Global Championship', description: 'Liga oficial.', position: 458, totalParticipants: 15000, userTeamName: 'Escudería Huevo' }
            ]
        };
    },

    getLeagueDetails: async (leagueId) => {
        await delay(500);
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
                    { position: 3, userName: 'Juan Pérez', teamName: 'Escudería Pistera', points: 1120, isCurrentUser: false }
                ]
            }
        };
    },

    createLeague: async (leagueData) => {
        await delay(800);
        const newLeague = {
            id: mockDatabase.leagues.length + 1,
            owner_id: 1,
            join_code: "F2-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            ...leagueData
        };
        mockDatabase.leagues.push(newLeague);
        return { status: 'success', message: 'Liga creada exitosamente', data: newLeague };
    },

    joinLeague: async (joinData) => {
        await delay(600);
        return { status: 'success', message: '¡Te has unido a la liga con éxito!' };
    },

    leaveLeague: async (leagueId) => {
        await delay(600);
        return { status: 'success', message: 'Has abandonado la liga correctamente.' };
    },
    
    // ==========================================
    // MERCADO Y EQUIPOS
    // ==========================================
    getMarketData: async () => {
        await delay(500);
        
        // 1. Mapeamos los pilotos cruzando datos con las escuderías
        const mappedDrivers = mockDatabase.drivers.map(driver => {
            // Buscamos a qué escudería pertenece este piloto
            const teamInfo = mockDatabase.constructors.find(c => c.id === driver.constructor_id);
            
            return {
                id: `d${driver.id}`, // Le agregamos la 'd' para mantener tu lógica de IDs
                name: driver.name,
                team: teamInfo ? teamInfo.name : 'Agente Libre',
                price: driver.market_price
            };
        });

        // 2. Mapeamos las escuderías
        const mappedConstructors = mockDatabase.constructors.map(constructor => ({
            id: `c${constructor.id}`,
            name: constructor.name,
            type: 'Escudería',
            price: constructor.market_price
        }));

        return {
            status: 'success',
            data: {
                drivers: mappedDrivers,
                constructors: mappedConstructors
            }
        };
    },

    getUserTeams: async () => {
        await delay(400); 
        // Ahora lee directamente de la base de datos simulada
        const teams = mockDatabase.fantasyTeams.map(team => ({
            id: team.id,
            name: team.name,
            totalPoints: team.total_points || Math.floor(Math.random() * 500) + 1000,
            remainingBudget: team.budget_remaining || 0,
            teamValue: 100 - (team.budget_remaining || 0)
        }));

        return { status: 'success', data: teams };
    },

    saveTeam: async (teamData) => {
        await delay(800);
        const newTeam = {
            id: mockDatabase.fantasyTeams.length + 1,
            user_id: 1, 
            name: teamData.name || `Equipo ${mockDatabase.fantasyTeams.length + 1}`,
            budget_remaining: teamData.budgetLeft || 0,
            total_points: 0,
            free_transfers_remaining: 2,
            selected_drivers: teamData.drivers,
            selected_constructors: teamData.constructors
        };
        mockDatabase.fantasyTeams.push(newTeam);

        return { status: 'success', message: '¡Equipo guardado con éxito!', data: newTeam };
    },

    // ==========================================
    // PERFIL DE USUARIO
    // ==========================================
    
    // Obtener los datos del usuario logueado
    getUserProfile: async () => {
        await delay(400);
        const user = mockDatabase.users[0]; // Asumimos que es el usuario demo
        return {
            status: 'success',
            data: {
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username
            }
        };
    },

    // Actualizar nombre y apellido
    updateUserProfile: async (profileData) => {
        await delay(800);
        
        // Actualizamos nuestra base de datos falsa
        mockDatabase.users[0].first_name = profileData.firstName;
        mockDatabase.users[0].last_name = profileData.lastName;

        return {
            status: 'success',
            message: 'Perfil actualizado correctamente.'
        };
    },

    // Cambiar contraseña
    changePassword: async (passwordData) => {
        await delay(800);
        
        // Simplemente validamos que la nueva contraseña y la repetición coincidan
        if (passwordData.newPassword !== passwordData.repeatPassword) {
            throw new Error("Las contraseñas no coinciden");
        }

        return {
            status: 'success',
            message: 'Contraseña actualizada con éxito.'
        };
    }
};