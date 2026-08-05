import { fetchAPI } from './api.js';

export async function login(username, password) {
    const data = await fetchAPI('/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });

    localStorage.setItem('f2_token', data.token);
    
    // Extraemos el payload del JWT (la segunda parte separada por un punto)
    // Lo decodificamos para guardar el rol en el frontend
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    localStorage.setItem('f2_role', payload.role);
    
    return data;
}

export async function register(username, password, passwordConfirm) {
    const data = await fetchAPI('/users/', {
        method: 'POST',
        body: JSON.stringify({ username, password, repeatPassword: passwordConfirm })
    });
    return data;
}

export function logout() {
    localStorage.removeItem('f2_token');
    localStorage.removeItem('f2_role');
    window.location.href = 'index';
}

export function requireAuth() {
    if (!localStorage.getItem('f2_token')) {
        window.location.href = 'login';
    }
}