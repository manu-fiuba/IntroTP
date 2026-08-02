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
    }
    
    // Más adelante agregaremos getUser(), getDrivers(), createTeam(), etc.
};