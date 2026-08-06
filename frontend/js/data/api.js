const BACK_PORT = 5001 // puerto del backend (ver docker-compose.yml)
const API_BASE_URL = `http://localhost:${BACK_PORT}/api`;

const TOKEN_KEY = "f2_token";
const ROLE_KEY = "f2_role";

// SESIÓN (token JWT guardado en localStorage)
const Session = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    getUser: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;
        try {
            // Arreglo para que atob() no falle por falta de padding o caracteres Base64Url
            let base64Url = token.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4 !== 0) {
                base64 += '=';
            }
            const payload = JSON.parse(atob(base64));
            
            // Si el payload no tiene ID (token viejo o corrupto), forzamos null para que el frontend lo expulse
            if (!payload.id) return null; 
            
            return payload;
        } catch (e) { 
            return null; 
        }
    },
    save: (token, role) => {
        localStorage.setItem(TOKEN_KEY, token);
        if (role) localStorage.setItem(ROLE_KEY, role);
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
    },
    isLoggedIn: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        // Validamos no solo que exista, sino que sea válido y tenga ID
        return !!token && Session.getUser() !== null;
    }
};

// CLIENTE REAL (fetch)
async function fetchAPI(endpoint, options = {}) {
    const token = Session.getToken();
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (response.status === 204) return null;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                Session.clear();
                window.location.href = 'login';
            }
            throw new Error(data.error || 'Error en la petición al servidor');
        }
        return data;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('No se pudo conectar con el servidor.');
    }
}

// API PÚBLICA — esto es lo único que usan las páginas
const Api = {
    session: Session,
    users: {
        register: (data) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),
        login: async (data) => {
            const result = await fetchAPI("/users/login", { method: "POST", body: JSON.stringify(data) });
            const payload = JSON.parse(atob(result.token.split('.')[1]));
            Session.save(result.token, payload.role);
            return result;
        },
        getById: (id) => fetchAPI(`/users/${id}`),
        getTeams: (id) => fetchAPI(`/users/${id}/teams`),
        getLeagues: (id) => fetchAPI(`/users/${id}/leagues`),
        update: (id, data) => fetchAPI(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
        updatePassword: (id, data) => fetchAPI(`/users/${id}/password`, { method: "PATCH", body: JSON.stringify(data) }),
        delete: (id) => fetchAPI(`/users/${id}`, { method: "DELETE" }),
        logout: () => { Session.clear(); window.location.href = 'login'; }
    },
    teams: {
        create: (data) => fetchAPI("/teams", { method: "POST", body: JSON.stringify(data) }),
        getById: (id) => fetchAPI(`/teams/${id}`),
        updateRoster: (id, data) => fetchAPI(`/teams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id) => fetchAPI(`/teams/${id}`, { method: "DELETE" }),
        getRaceHistory: (id) => fetchAPI(`/teams/${id}/race-history`)
    },
    leagues: {
        create: (data) => fetchAPI("/leagues", { method: "POST", body: JSON.stringify(data) }),
        join: (data) => fetchAPI("/leagues/join", { method: "POST", body: JSON.stringify(data) }),
        getById: (id) => fetchAPI(`/leagues/${id}`),
        update: (id, data) => fetchAPI(`/leagues/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id) => fetchAPI(`/leagues/${id}`, { method: "DELETE" }),
        leave: (leagueId, teamId) => fetchAPI(`/leagues/${leagueId}/members/${teamId}`, { method: "DELETE" })
    },
    f2: {
        getDrivers: () => fetchAPI("/f2/drivers"),
        getDriverById: (id) => fetchAPI(`/f2/drivers/${id}`),
        getConstructors: () => fetchAPI("/f2/constructors"),
        getConstructorById: (id) => fetchAPI(`/f2/constructors/${id}`),
        getAllRaces: () => fetchAPI("/f2/races"),
        getNextRace: () => fetchAPI("/f2/races/next")
    }
};
window.Api = Api;
window.fetchAPI = fetchAPI;
