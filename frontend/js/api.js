const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('f2_token');
         
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('f2_token');
                localStorage.removeItem('f2_role');
                window.location.href = 'login.html';
            }
            // Lanzamos el error con el mensaje que viene del backend
            throw new Error(data.error || 'Error en la petición al servidor');
        }

        return data;
    } catch (error) {
        // Si el error es el que acabamos de lanzar arriba lo pasamos
        if (error instanceof Error) throw error; 
        throw new Error('No se pudo conectar con el servidor.');
    }
}