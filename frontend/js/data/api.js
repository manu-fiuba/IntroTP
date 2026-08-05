/**
 * CAPA DE API
 * ------------------------------------------------------------------
 * Cliente calcado 1 a 1 a las rutas reales de backend/src/routes/*.js:
 * mismos paths, mismo body de entrada, misma forma de respuesta
 * (recurso "pelado" + { message } en éxito, { error } en fallo con
 * el status HTTP correspondiente).
 *
 * Con USE_MOCK = true, cada función resuelve contra MOCK_DB simulando
 * exactamente esas mismas respuestas (incluidos los errores). Con
 * USE_MOCK = false, hace fetch() de verdad contra el backend.
 * Las páginas (js/pages/*.js) llaman siempre a Api.recurso.accion(...)
 * y nunca se enteran de cuál de los dos modos está activo.
 *
 * ⚠️ Para activar el backend real: poner USE_MOCK en false. Nada más
 * en el frontend debería necesitar cambiar (ver README de esta rama
 * cuando el backend arregle los bugs de nombres de columna).
 */

const API_BASE_URL = "http://localhost:5000/api"; // puerto real del backend (ver docker-compose.yml)
const USE_MOCK = false  ; // <-- cambiar a false cuando el backend esté levantado

const TOKEN_KEY = "f2fantasy_token";
const USER_KEY = "f2fantasy_user";

// ==========================================================
// SESIÓN (token JWT guardado en localStorage, igual que haría
// cualquier frontend real con el backend de verdad)
// ==========================================================
const Session = {
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    getUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },
    save(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
    isLoggedIn() { return !!Session.getToken(); }
};

// ==========================================================
// CLIENTE REAL (fetch), se usa cuando USE_MOCK = false
// ==========================================================
async function request(method, path, body, auth = false) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = Session.getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        // El backend real siempre manda { error: '...' } cuando falla
        throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
}

// ==========================================================
// MOCK (simula exactamente las mismas respuestas que el backend real)
// ==========================================================
const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Un token mock trae el id de usuario adentro, para poder "autenticar"
// al que llama sin tener un servidor de verdad.
function mockCreateToken(userId) {
    return `mock.${userId}.${Date.now()}`;
}
function mockUserIdFromToken(token) {
    if (!token) return null;
    const parts = token.split(".");
    return parts.length === 3 ? parseInt(parts[1], 10) : null;
}
// Simula al middleware authenticateToken: si no hay token, 401.
function mockRequireAuth() {
    const token = Session.getToken();
    const userId = mockUserIdFromToken(token);
    if (!userId) {
        const err = new Error("Acceso denegado. Se requiere un token de autenticación.");
        throw err;
    }
    return userId;
}

const MockUsers = {
    async register({ username, password, repeatPassword }) {
        await mockDelay();
        if (!username || !password || !repeatPassword) {
            throw new Error("Todos los campos son obligatorios.");
        }
        if (password !== repeatPassword) {
            throw new Error("Las contraseñas no coinciden.");
        }
        if (MOCK_DB.users.some(u => u.username === username)) {
            throw new Error("El nombre de usuario ya está en uso.");
        }
        const newUser = { id: MOCK_DB.nextIds.users++, username, password, first_name: null, last_name: null };
        MOCK_DB.users.push(newUser);
        return { message: "Usuario registrado con éxito", user: { id: newUser.id, username: newUser.username } };
    },

    async login({ username, password }) {
        await mockDelay();
        if (!username || !password) {
            throw new Error("El usuario y la contraseña son obligatorios.");
        }
        const user = MOCK_DB.users.find(u => u.username === username);
        if (!user || user.password !== password) {
            throw new Error("Credenciales inválidas.");
        }
        const token = mockCreateToken(user.id);
        return { message: "Login exitoso", token, user: { id: user.id, username: user.username } };
    },

    async getById(id) {
        await mockDelay();
        const user = MOCK_DB.users.find(u => u.id === Number(id));
        if (!user) throw new Error("Usuario no encontrado.");
        // NOTA: el backend real hoy solo hace "SELECT id, username" acá,
        // sin first_name/last_name. Para que profile.html pueda mostrar
        // el nombre completo, van a necesitar agregarlos a esa query.
        return { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name };
    },

    async getTeams(id) {
        await mockDelay();
        // Igual que "SELECT * FROM fantasy_teams WHERE user_id = $1":
        // solo las columnas de la tabla, sin drivers/constructors.
        return MOCK_DB.fantasy_teams
            .filter(t => t.user_id === Number(id))
            .map(({ id, user_id, name, budget_remaining, total_points, free_transfers_remaining }) =>
                ({ id, user_id, name, budget_remaining, total_points, free_transfers_remaining }));
    },

    async getLeagues(id) {
        await mockDelay();
        const teamIds = MOCK_DB.fantasy_teams.filter(t => t.user_id === Number(id)).map(t => t.id);
        const leagueIds = new Set(
            MOCK_DB.league_members.filter(m => teamIds.includes(m.fantasy_team_id)).map(m => m.league_id)
        );
        return MOCK_DB.leagues
            .filter(l => leagueIds.has(l.id))
            .map(({ id, name, description, max_participants }) => ({ id, name, description, max_participants }));
    },

    async update(id, { first_name, last_name }) {
        await mockDelay();
        const authUserId = mockRequireAuth();
        if (authUserId !== Number(id)) throw new Error("No tienes permiso para modificar este perfil.");
        const user = MOCK_DB.users.find(u => u.id === Number(id));
        if (first_name !== undefined) user.first_name = first_name;
        if (last_name !== undefined) user.last_name = last_name;
        return { message: "Perfil actualizado con éxito", user: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name } };
    },

    async updatePassword(id, { currentPassword, newPassword, repeatNewPassword }) {
        await mockDelay();
        const authUserId = mockRequireAuth();
        if (authUserId !== Number(id)) throw new Error("No tienes permiso para realizar esta acción.");
        if (!currentPassword || !newPassword || !repeatNewPassword) {
            throw new Error("Todos los campos son obligatorios.");
        }
        if (newPassword !== repeatNewPassword) {
            throw new Error("Las nuevas contraseñas no coinciden.");
        }
        const user = MOCK_DB.users.find(u => u.id === Number(id));
        if (user.password !== currentPassword) {
            throw new Error("La contraseña actual es incorrecta.");
        }
        user.password = newPassword;
        return { message: "Contraseña actualizada con éxito." };
    },

    async delete(id) {
        await mockDelay();
        const authUserId = mockRequireAuth();
        if (authUserId !== Number(id)) throw new Error("No tienes permiso para eliminar esta cuenta.");
        MOCK_DB.users = MOCK_DB.users.filter(u => u.id !== Number(id));
        return { message: "Cuenta eliminada permanentemente." };
    }
};

const MockTeams = {
    async create({ name }) {
        await mockDelay();
        const userId = mockRequireAuth();
        if (!name) throw new Error("El nombre del equipo es obligatorio.");
        // Límite de 3 equipos por usuario (según los 3 slots de home.html).
        // Si el backend real no valida esto todavía, avisar para que lo agreguen.
        const misEquipos = MOCK_DB.fantasy_teams.filter(t => t.user_id === userId);
        if (misEquipos.length >= 3) {
            throw new Error("Ya alcanzaste el límite de 3 equipos.");
        }
        const newTeam = {
            id: MOCK_DB.nextIds.fantasy_teams++,
            user_id: userId,
            name,
            budget_remaining: 100.0,
            total_points: 0,
            free_transfers_remaining: 2,
            driver_ids: [],
            constructor_ids: []
        };
        MOCK_DB.fantasy_teams.push(newTeam);
        return { message: "Equipo creado con éxito", team: newTeam };
    },

    async getById(id) {
        await mockDelay();
        const team = MOCK_DB.fantasy_teams.find(t => t.id === Number(id));
        if (!team) throw new Error("Equipo no encontrado.");
        const drivers = MOCK_DB.drivers
            .filter(d => team.driver_ids.includes(d.id))
            .map(({ id, name, market_price, total_points }) => ({ id, name, market_price, total_points }));
        const constructors = MOCK_DB.constructors
            .filter(c => team.constructor_ids.includes(c.id))
            .map(({ id, name, market_price, total_points }) => ({ id, name, market_price, total_points }));
        return { ...team, drivers, constructors };
    },

    async updateRoster(id, { driver_ids, constructor_ids }) {
        await mockDelay();
        const userId = mockRequireAuth();
        if (!Array.isArray(driver_ids) || driver_ids.length !== 5) {
            throw new Error("Debes seleccionar exactamente 5 pilotos.");
        }
        if (!Array.isArray(constructor_ids) || constructor_ids.length !== 2) {
            throw new Error("Debes seleccionar exactamente 2 escuderías.");
        }
        const team = MOCK_DB.fantasy_teams.find(t => t.id === Number(id));
        if (!team) throw new Error("Equipo no encontrado.");
        if (team.user_id !== userId) throw new Error("No tienes permiso para modificar este equipo.");

        const COSTO_POR_TRANSFERENCIA_EXTRA = 10;
        const oldDriverIds = team.driver_ids;
        const oldConstructorIds = team.constructor_ids;

        // Igual que el backend real: si el equipo estaba vacío (primera vez
        // que se arma), no cuenta como transferencia.
        let totalTransfersMade = 0;
        let remainingFree = team.free_transfers_remaining;
        let pointsPenalty = 0;

        if (oldDriverIds.length === 0 && oldConstructorIds.length === 0) {
            totalTransfersMade = 0;
        } else {
            const changedDrivers = driver_ids.filter(id => !oldDriverIds.includes(id)).length;
            const changedConstructors = constructor_ids.filter(id => !oldConstructorIds.includes(id)).length;
            totalTransfersMade = changedDrivers + changedConstructors;

            if (totalTransfersMade > remainingFree) {
                const extraTransfers = totalTransfersMade - remainingFree;
                pointsPenalty = extraTransfers * COSTO_POR_TRANSFERENCIA_EXTRA;
                remainingFree = 0;
            } else {
                remainingFree = remainingFree - totalTransfersMade;
            }
        }

        const driversCost = MOCK_DB.drivers.filter(d => driver_ids.includes(d.id)).reduce((sum, d) => sum + d.market_price, 0);
        const constructorsCost = MOCK_DB.constructors.filter(c => constructor_ids.includes(c.id)).reduce((sum, c) => sum + c.market_price, 0);
        const totalCost = driversCost + constructorsCost;

        if (totalCost > 100.0) {
            throw new Error(`Presupuesto excedido. Costo total: ${totalCost}M. Límite: 100.0M.`);
        }

        team.budget_remaining = 100.0 - totalCost;
        team.free_transfers_remaining = remainingFree;
        team.total_points = team.total_points - pointsPenalty;
        team.driver_ids = [...driver_ids];
        team.constructor_ids = [...constructor_ids];

        return {
            message: pointsPenalty > 0
                ? `Roster actualizado con éxito. Se descontaron ${pointsPenalty} puntos por transferencias extra.`
                : "Roster actualizado con éxito",
            budget_remaining: team.budget_remaining
        };
    },

    async delete(id) {
        await mockDelay();
        const userId = mockRequireAuth();
        const team = MOCK_DB.fantasy_teams.find(t => t.id === Number(id) && t.user_id === userId);
        if (!team) throw new Error("Equipo no encontrado o no tienes permisos para borrarlo.");
        MOCK_DB.fantasy_teams = MOCK_DB.fantasy_teams.filter(t => t !== team);
        return { message: "Equipo eliminado correctamente." };
    },

    // ⚠️ No hay endpoint real para esto todavía (ver nota en mock-data.js).
    async getRaceHistory(id) {
        await mockDelay();
        return MOCK_DB.team_race_history[id] || { lastRace: null, bestWeek: null };
    }
};

const MockLeagues = {
    async create({ name, description, max_participants, password }) {
        await mockDelay();
        const ownerId = mockRequireAuth();
        if (!name || !max_participants) {
            throw new Error("Nombre y límite de participantes son obligatorios.");
        }
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
        let joinCode = "";
        for (let i = 0; i < 6; i++) joinCode += chars[Math.floor(Math.random() * chars.length)];

        // Igual que el backend real: sin contraseña, la liga queda pública (sin hash).
        const hasPassword = password && password.trim() !== "";
        const newLeague = { id: MOCK_DB.nextIds.leagues++, owner_id: ownerId, name, description, max_participants, join_code: joinCode, password: hasPassword ? password : null };
        MOCK_DB.leagues.push(newLeague);
        const userTeam = MOCK_DB.fantasy_teams.find(t => t.user_id === ownerId);
        if (userTeam) {
            MOCK_DB.league_members.push({ league_id: newLeague.id, fantasy_team_id: userTeam.id });
        }
        return { message: "Liga creada con éxito.", league: { id: newLeague.id, name: newLeague.name, join_code: newLeague.join_code } };
    },

    async join({ join_code, password, fantasy_team_id }) {
        await mockDelay();
        const userId = mockRequireAuth();
        if (!join_code || !fantasy_team_id) {
            throw new Error("Código de liga e ID de tu equipo son obligatorios.");
        }
        const team = MOCK_DB.fantasy_teams.find(t => t.id === Number(fantasy_team_id) && t.user_id === userId);
        if (!team) throw new Error("El equipo no te pertenece o no existe.");

        const league = MOCK_DB.leagues.find(l => l.join_code === join_code);
        if (!league) throw new Error("Liga no encontrada.");

        // Solo se valida contraseña si la liga es privada (tiene una seteada).
        if (league.password !== null) {
            if (!password) throw new Error("Esta liga requiere una contraseña para ingresar.");
            if (league.password !== password) throw new Error("Contraseña de liga incorrecta.");
        }

        const currentMembers = MOCK_DB.league_members.filter(m => m.league_id === league.id).length;
        if (currentMembers >= league.max_participants) throw new Error("La liga ya ha alcanzado su límite de participantes.");

        const alreadyMember = MOCK_DB.league_members.some(m => m.league_id === league.id && m.fantasy_team_id === team.id);
        if (alreadyMember) throw new Error("Tu equipo ya forma parte de esta liga.");

        MOCK_DB.league_members.push({ league_id: league.id, fantasy_team_id: team.id });
        return { message: "Te has unido a la liga exitosamente." };
    },

    async getById(id) {
        await mockDelay();
        const league = MOCK_DB.leagues.find(l => l.id === Number(id));
        if (!league) throw new Error("Liga no encontrada.");

        const leaderboard = MOCK_DB.league_members
            .filter(m => m.league_id === league.id)
            .map(m => {
                const team = MOCK_DB.fantasy_teams.find(t => t.id === m.fantasy_team_id);
                const user = MOCK_DB.users.find(u => u.id === team.user_id);
                return { team_id: team.id, team_name: team.name, manager_name: user.username, total_points: team.total_points };
            })
            .sort((a, b) => b.total_points - a.total_points);

        const owner = MOCK_DB.users.find(u => u.id === league.owner_id);

        return {
            id: league.id, name: league.name, description: league.description,
            max_participants: league.max_participants, owner_id: league.owner_id,
            // ⚠️ owner_username y join_code NO vienen del backend real hoy
            // (GET /api/leagues/:id solo devuelve id/name/description/
            // max_participants/owner_id/leaderboard). Van a necesitar
            // agregarlos para que "Administrador" y "Código de invitación"
            // funcionen de verdad.
            owner_username: owner ? owner.username : null,
            join_code: league.join_code,
            leaderboard
        };
    },

    // ⚠️ No existe ningún endpoint real para que un miembro abandone una
    // liga sin borrarla — solo hay DELETE /api/leagues/:id (borra la liga
    // entera, y encima solo lo puede hacer el dueño). Van a necesitar algo
    // como DELETE /api/leagues/:id/members/:teamId.
    async leave(leagueId, teamId) {
        await mockDelay();
        const userId = mockRequireAuth();
        const team = MOCK_DB.fantasy_teams.find(t => t.id === Number(teamId) && t.user_id === userId);
        if (!team) throw new Error("Ese equipo no te pertenece.");
        const before = MOCK_DB.league_members.length;
        MOCK_DB.league_members = MOCK_DB.league_members.filter(
            m => !(m.league_id === Number(leagueId) && m.fantasy_team_id === Number(teamId))
        );
        if (MOCK_DB.league_members.length === before) {
            throw new Error("Tu equipo no forma parte de esta liga.");
        }
        return { message: "Abandonaste la liga correctamente." };
    },

    async update(id, { name, description, max_participants }) {
        await mockDelay();
        const userId = mockRequireAuth();
        const league = MOCK_DB.leagues.find(l => l.id === Number(id));
        if (!league) throw new Error("Liga no encontrada.");
        if (league.owner_id !== userId) throw new Error("Solo el creador puede modificar la liga.");

        if (name !== undefined) league.name = name;
        if (description !== undefined) league.description = description;
        if (max_participants !== undefined) league.max_participants = max_participants;

        return { message: "Liga actualizada correctamente", league: { id: league.id, name: league.name, description: league.description, max_participants: league.max_participants } };
    },

    async delete(id) {
        await mockDelay();
        const userId = mockRequireAuth();
        const league = MOCK_DB.leagues.find(l => l.id === Number(id) && l.owner_id === userId);
        if (!league) throw new Error("Liga no encontrada o permisos insuficientes.");
        MOCK_DB.leagues = MOCK_DB.leagues.filter(l => l !== league);
        MOCK_DB.league_members = MOCK_DB.league_members.filter(m => m.league_id !== league.id);
        return { message: "Liga eliminada permanentemente." };
    }
};

const MockF2 = {
    async getDrivers() {
        await mockDelay();
        return [...MOCK_DB.drivers].sort((a, b) => b.market_price - a.market_price);
    },
    async getDriverById(id) {
        await mockDelay();
        const driver = MOCK_DB.drivers.find(d => d.id === Number(id));
        if (!driver) throw new Error("Piloto no encontrado.");
        return driver;
    },
    async getConstructors() {
        await mockDelay();
        return [...MOCK_DB.constructors].sort((a, b) => b.market_price - a.market_price);
    },
    async getConstructorById(id) {
        await mockDelay();
        const constructor = MOCK_DB.constructors.find(c => c.id === Number(id));
        if (!constructor) throw new Error("Escudería no encontrada.");
        return constructor;
    },
    // Igual que calculateCountdown() del backend real
    _countdown(dateStr) {
        const diffMs = new Date(dateStr) - new Date();
        if (diffMs <= 0) return { status: "completed", countdown: "Finalizada" };
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / 1000 / 60) % 60);
        return { status: "upcoming", countdown: `${days}d ${hours}h ${minutes}m` };
    },
    async getAllRaces() {
        await mockDelay();
        return [...MOCK_DB.races]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(race => ({ ...race, ...MockF2._countdown(race.date) }));
    },
    async getNextRace() {
        await mockDelay();
        const upcoming = MOCK_DB.races
            .filter(r => new Date(r.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        if (!upcoming) return null; // el backend real manda 404 acá; las páginas deben manejar el caso "sin carreras"
        return { ...upcoming, ...MockF2._countdown(upcoming.date) };
    }
};

// ==========================================================
// API PÚBLICA — esto es lo único que usan las páginas.
// Misma forma exista o no el backend real.
// ==========================================================
const Api = {

    session: Session,

    users: {
        register: (data) => USE_MOCK ? MockUsers.register(data) : request("POST", "/users", data),

        login: async (data) => {
            const result = USE_MOCK ? await MockUsers.login(data) : await request("POST", "/users/login", data);
            Session.save(result.token, result.user);
            return result;
        },

        getById: (id) => USE_MOCK ? MockUsers.getById(id) : request("GET", `/users/${id}`),
        getTeams: (id) => USE_MOCK ? MockUsers.getTeams(id) : request("GET", `/users/${id}/teams`),
        getLeagues: (id) => USE_MOCK ? MockUsers.getLeagues(id) : request("GET", `/users/${id}/leagues`),
        update: (id, data) => USE_MOCK ? MockUsers.update(id, data) : request("PATCH", `/users/${id}`, data, true),
        updatePassword: (id, data) => USE_MOCK ? MockUsers.updatePassword(id, data) : request("PATCH", `/users/${id}/password`, data, true),
        delete: (id) => USE_MOCK ? MockUsers.delete(id) : request("DELETE", `/users/${id}`, undefined, true),

        logout: () => Session.clear()
    },

    teams: {
        create: (data) => USE_MOCK ? MockTeams.create(data) : request("POST", "/teams", data, true),
        getById: (id) => USE_MOCK ? MockTeams.getById(id) : request("GET", `/teams/${id}`),
        updateRoster: (id, data) => USE_MOCK ? MockTeams.updateRoster(id, data) : request("PUT", `/teams/${id}`, data, true),
        delete: (id) => USE_MOCK ? MockTeams.delete(id) : request("DELETE", `/teams/${id}`, undefined, true),
        // ⚠️ Mock-only: todavía no existe GET /api/teams/:id/race-history en el backend real.
        getRaceHistory: (id) => USE_MOCK ? MockTeams.getRaceHistory(id) : request("GET", `/teams/${id}/race-history`)
    },

    leagues: {
        create: (data) => USE_MOCK ? MockLeagues.create(data) : request("POST", "/leagues", data, true),
        join: (data) => USE_MOCK ? MockLeagues.join(data) : request("POST", "/leagues/join", data, true),
        getById: (id) => USE_MOCK ? MockLeagues.getById(id) : request("GET", `/leagues/${id}`),
        update: (id, data) => USE_MOCK ? MockLeagues.update(id, data) : request("PUT", `/leagues/${id}`, data, true),
        delete: (id) => USE_MOCK ? MockLeagues.delete(id) : request("DELETE", `/leagues/${id}`, undefined, true),
        // ⚠️ Mock-only: no existe endpoint real para esto todavía (ver nota en MockLeagues.leave).
        leave: (leagueId, teamId) => USE_MOCK ? MockLeagues.leave(leagueId, teamId) : request("DELETE", `/leagues/${leagueId}/members/${teamId}`, undefined, true)
    },

    f2: {
        getDrivers: () => USE_MOCK ? MockF2.getDrivers() : request("GET", "/f2/drivers"),
        getDriverById: (id) => USE_MOCK ? MockF2.getDriverById(id) : request("GET", `/f2/drivers/${id}`),
        getConstructors: () => USE_MOCK ? MockF2.getConstructors() : request("GET", "/f2/constructors"),
        getConstructorById: (id) => USE_MOCK ? MockF2.getConstructorById(id) : request("GET", `/f2/constructors/${id}`),
        getAllRaces: () => USE_MOCK ? MockF2.getAllRaces() : request("GET", "/f2/races"),
        getNextRace: () => USE_MOCK ? MockF2.getNextRace() : request("GET", "/f2/races/next")
    }
};