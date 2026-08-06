import { fetchAPI } from './js/api.js';

const userRole = localStorage.getItem('f2_role');
if (userRole !== 'admin') {
    alert('Acceso denegado. Se requieren permisos de administrador.');
    window.location.href = 'home';
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('admin-races-container');
    
    try {
        const races = await fetchAPI('/f2/races'); 
        
        const now = new Date();
        
        const upcomingRaces = races.filter(r => new Date(r.date) >= now);
        const pastRaces = races.filter(r => new Date(r.date) < now);
        
        upcomingRaces.sort((a, b) => new Date(a.date) - new Date(b.date));
        pastRaces.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const sortedRaces = [...upcomingRaces, ...pastRaces];

        renderRaces(sortedRaces, container);
    } catch (error) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ff4444;">
                <p>Error al conectar con la base de datos.</p>
                <small>${error.message}</small>
            </div>
        `;
    }

    container.addEventListener('click', (e) => {
        const header = e.target.closest('.admin-race-header');
        if (header) {
            const card = header.closest('.admin-race-card');
            card.classList.toggle('active');
            return;
        }

        const sessionBtn = e.target.closest('.session-btn');
        if (sessionBtn) {
            const raceId = sessionBtn.dataset.raceId;
            const sessionType = sessionBtn.dataset.session;
            const card = sessionBtn.closest('.admin-race-card');
            
            abrirFormularioResultados(card, raceId, sessionType);
        }
    });
});

function renderRaces(races, container) {
    container.innerHTML = races.map(race => `
        <article class="admin-race-card" id="race-${race.id}">
            <div class="admin-race-header">
                <div class="admin-race-info-compact">
                    <span class="round-badge">ROUND ${race.round_number}</span>
                    <h3>${race.name}</h3>
                </div>
                <span class="race-date">${formatDate(race.date)}</span>
            </div>
            
            <div class="admin-sessions-panel">
                <button class="btn btn-secondary session-btn" data-race-id="${race.id}" data-session="qualy">Qualy</button>
                <button class="btn btn-secondary session-btn" data-race-id="${race.id}" data-session="sprint">Sprint</button>
                <button class="btn btn-primary session-btn" data-race-id="${race.id}" data-session="feature">Feature</button>
                
                <div class="admin-results-form" id="form-container-${race.id}"></div>
            </div>
        </article>
    `).join('');
}

async function abrirFormularioResultados(cardElement, raceId, sessionType) {
    const formContainer = cardElement.querySelector(`#form-container-${raceId}`);
    
    cardElement.querySelectorAll('.session-btn').forEach(b => b.style.opacity = '0.5');
    cardElement.querySelector(`.session-btn[data-session="${sessionType}"]`).style.opacity = '1';

    formContainer.classList.add('active');
    formContainer.innerHTML = `<p style="color: #aaa; text-align: center;">Cargando base de datos...</p>`;

    try {
        // Obtenemos TODO: Pilotos, Escuderías y los Resultados que ya existen en esta carrera
        const [drivers, constructors, existingResults] = await Promise.all([
            fetchAPI('/f2/drivers'),
            fetchAPI('/f2/constructors'),
            fetchAPI(`/admin/results/race/${raceId}`)
        ]);

        // Función para saber si ya hay puntos cargados
        const getExistingPoints = (entityId, entityType) => {
            const row = existingResults.find(r => r.entity_id === entityId && r.entity_type === entityType);
            return row ? row[`${sessionType}_points`] : null;
        };

        // Verifica si hay ALGO cargado para habilitar el botón de borrado masivo
        const hasExistingData = existingResults.some(r => r[`${sessionType}_points`] !== null && r[`${sessionType}_points`] !== 0);
        
        // 1. GENERAMOS INPUTS PARA PILOTOS
        const driversListHTML = drivers.map(driver => {
            const currentPts = getExistingPoints(driver.id, 'DRIVER');
            const ptLabel = (currentPts !== null && currentPts !== 0) ? `<span style="color: #ffaa00; font-size: 0.8rem; margin-left: 8px;">(Actual: ${currentPts} pts)</span>` : '';
            
            return `
            <div class="driver-result-row">
                <div class="driver-result-info">
                    <strong>${driver.name}</strong> ${ptLabel}
                </div>
                <div class="driver-result-inputs">
                    <input type="text" name="pos_driver_${driver.id}" placeholder="Pos (Ej: 1, DNF)" style="background-color: #1e1e1e; border: 1px solid #444; color: #fff; padding: 0.4rem; border-radius: 4px; width: 120px; text-transform: uppercase;">
                </div>
            </div>`;
        }).join('');

        // 2. GENERAMOS MENÚ PARA ESCUDERÍAS (Solo Qualy)
        let constructorsListHTML = '';
        if (sessionType === 'qualy') {
            constructorsListHTML = `
                <h5 style="color: #589bd8; margin-top: 1.5rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #333;">Escuderías</h5>
                ${constructors.map(c => {
                    const currentPts = getExistingPoints(c.id, 'CONSTRUCTOR');
                    const ptLabel = (currentPts !== null && currentPts !== 0) ? `<span style="color: #ffaa00; font-size: 0.8rem; margin-left: 8px;">(Actual: ${currentPts} pts)</span>` : '';
                    return `
                    <div class="driver-result-row">
                        <div class="driver-result-info">
                            <strong>${c.name}</strong> ${ptLabel}
                        </div>
                        <div class="driver-result-inputs">
                            <select name="qualy_constructor_${c.id}" style="background-color: #1e1e1e; border: 1px solid #444; color: #fff; padding: 0.4rem; border-radius: 4px; width: 100%;">
                                <option value="">-- Ignorar --</option>
                                <option value="-1">Ninguno en Q2 (-1 pt)</option>
                                <option value="1">Uno en Q2 (1 pt)</option>
                                <option value="3">Ambos en Q2 (3 pts)</option>
                                <option value="5">Uno en Q3 (5 pts)</option>
                                <option value="10">Ambos en Q3 (10 pts)</option>
                            </select>
                        </div>
                    </div>`;
                }).join('')}
            `;
        }

        const sessionTitles = { qualy: 'Clasificación', sprint: 'Carrera Sprint', feature: 'Carrera Principal' };
        
        formContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>Resultados: ${sessionTitles[sessionType]}</h4>
                ${hasExistingData ? `<button type="button" class="btn btn-danger clear-session-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Borrar Datos de Sesión</button>` : ''}
            </div>
            
            <form id="form-submit-${raceId}-${sessionType}">
                ${driversListHTML}
                ${constructorsListHTML}
                <div style="margin-top: 1.5rem; text-align: right; display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-outline close-form-btn">Cerrar</button>
                    <button type="submit" class="btn btn-primary submit-results-btn">Guardar Cambios</button>
                </div>
            </form>
        `;

        // Cerrar form
        formContainer.querySelector('.close-form-btn').addEventListener('click', () => {
            formContainer.classList.remove('active');
            cardElement.querySelectorAll('.session-btn').forEach(b => b.style.opacity = '1');
        });

        // BOTÓN: BORRAR SESIÓN
        if (hasExistingData) {
            formContainer.querySelector('.clear-session-btn').addEventListener('click', async () => {
                if (!confirm('¿Estás seguro de borrar todos los resultados de esta sesión? Tu backend descontará los puntos automáticamente de los usuarios.')) return;
                
                try {
                    let deletedCount = 0;
                    for (const row of existingResults) {
                        // Si la fila tiene puntos asignados para esta sesión, la mandamos a 0
                        if (row[`${sessionType}_points`] !== 0 && row[`${sessionType}_points`] !== null) {
                            await fetchAPI(`/admin/results/${row.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ [`${sessionType}_points`]: 0 })
                            });
                            deletedCount++;
                        }
                    }
                    alert(`¡Éxito! Se han reseteado ${deletedCount} resultados.`);
                    abrirFormularioResultados(cardElement, raceId, sessionType); // Recargamos para actualizar vista
                } catch (error) {
                    alert(`Error al limpiar sesión: ${error.message}`);
                }
            });
        }

        // MOTOR DE NEGOCIO
        function calculateDriverPoints(session, posRaw) {
            if (!posRaw || posRaw.trim() === '') return null;
            const pos = posRaw.toString().trim().toUpperCase();
            
            if (['DSQ', 'DNF', 'NC', 'NQ', 'DNS', 'SINTIEMPO'].includes(pos)) {
                if (session === 'qualy') return -5;
                if (session === 'sprint') return -10;
                if (session === 'feature') return -20;
            }
            
            const p = parseInt(pos);
            if (isNaN(p) || p < 1 || p > 22) return null; 
            
            if (session === 'qualy') {
                if (p === 1) return 10;
                if (p === 2) return 9;
                if (p >= 3 && p <= 10) return 11 - p;
                return 0; 
            }
            if (session === 'sprint') {
                if (p >= 1 && p <= 8) return 9 - p;
                return 0; 
            }
            if (session === 'feature') {
                const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
                if (p >= 1 && p <= 10) return pointsTable[p - 1];
                return 0; 
            }
            return null;
        }

        // BOTÓN: GUARDAR
        formContainer.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const submitBtn = e.target.querySelector('.submit-results-btn');

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Procesando...';

                let driverPointsMap = {};
                let constructorPointsMap = {};
                let procesados = 0;

                // 1. EVALUAR PILOTOS
                for (const driver of drivers) {
                    const rawVal = formData.get(`pos_driver_${driver.id}`);
                    const pts = calculateDriverPoints(sessionType, rawVal);
                    
                    if (pts !== null) {
                        driverPointsMap[driver.id] = pts;
                        if (sessionType !== 'qualy') {
                            if (constructorPointsMap[driver.constructor_id] === undefined) constructorPointsMap[driver.constructor_id] = 0;
                            constructorPointsMap[driver.constructor_id] += pts;
                        }
                    }
                }

                // 2. EVALUAR ESCUDERÍAS (Solo Qualy)
                if (sessionType === 'qualy') {
                    for (const c of constructors) {
                        const rawVal = formData.get(`qualy_constructor_${c.id}`);
                        if (rawVal) constructorPointsMap[c.id] = parseInt(rawVal);
                    }
                }

                // Función auxiliar para Guardar o Actualizar
                const saveOrUpdate = async (entityId, entityType, pts) => {
                    const existingRow = existingResults.find(r => r.entity_id === entityId && r.entity_type === entityType);
                    
                    if (existingRow) {
                        // Si ya existe, enviamos PATCH para actualizar solo los puntos de esta sesión
                        await fetchAPI(`/admin/results/${existingRow.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ [`${sessionType}_points`]: pts })
                        });
                    } else {
                        // Si no existe, enviamos POST nuevo
                        const payload = {
                            race_id: parseInt(raceId),
                            entity_id: entityId,
                            entity_type: entityType,
                            qualy_points: sessionType === 'qualy' ? pts : 0,
                            sprint_points: sessionType === 'sprint' ? pts : 0,
                            feature_points: sessionType === 'feature' ? pts : 0
                        };
                        await fetchAPI('/admin/results', { method: 'POST', body: JSON.stringify(payload) });
                    }
                };

                // 3. ENVIAR A LA BASE DE DATOS
                for (const [dId, pts] of Object.entries(driverPointsMap)) {
                    await saveOrUpdate(parseInt(dId), 'DRIVER', pts);
                    procesados++;
                }

                for (const [cId, pts] of Object.entries(constructorPointsMap)) {
                    await saveOrUpdate(parseInt(cId), 'CONSTRUCTOR', pts);
                    procesados++;
                }

                if (procesados === 0) {
                    alert('No se detectaron nuevas entradas.');
                } else {
                    alert(`¡Registros actualizados! Se aplicaron cambios a ${procesados} entidades.`);
                    abrirFormularioResultados(cardElement, raceId, sessionType); // Refresca para mostrar el texto naranja
                }
            } catch (error) {
                alert(`Error al guardar: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Cambios';
            }
        });

    } catch (error) {
        formContainer.innerHTML = `<p style="color: #ff4444;">Error de red: ${error.message}</p>`;
    }
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
}
