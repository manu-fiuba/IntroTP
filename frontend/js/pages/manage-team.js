// js/pages/create-team.js

document.addEventListener('DOMContentLoaded', async () => {
    // ESTADO DE LA APP (Variables que van a ir cambiando)
    let budget = 100.0;
    let selectedDrivers = [];
    let selectedConstructors = [];
    const MAX_DRIVERS = 5;
    const MAX_CONSTRUCTORS = 2;
    let marketData = { drivers: [], constructors: [] };

    // REFERENCIAS AL DOM
    const ui = {
        budget: document.getElementById('budget-value'),
        slots: document.getElementById('slots-value'),
        marketList: document.getElementById('market-list'),
        saveBtn: document.getElementById('save-team-btn'),
        driverSlots: document.querySelectorAll('.driver-slot'),
        constructorSlots: document.querySelectorAll('.constructor-slot')
    };

    // ==========================================
    // 1. CARGAR Y RENDERIZAR MERCADO
    // ==========================================
    const loadMarket = async () => {
        try {
            const response = await api.getMarketData();
            if (response.status === 'success') {
                marketData = response.data;
                renderMarket();
            }
        } catch (error) {
            ui.marketList.innerHTML = '<p>Error al cargar el mercado.</p>';
        }
    };

    const renderMarket = () => {
        ui.marketList.innerHTML = ''; // Limpiar

        // Renderizar Pilotos
        marketData.drivers.forEach(driver => {
            const isSelected = selectedDrivers.some(d => d.id === driver.id);
            ui.marketList.innerHTML += createMarketItemHTML(driver, 'driver', isSelected);
        });

        // Renderizar Escuderías
        marketData.constructors.forEach(constructor => {
            const isSelected = selectedConstructors.some(c => c.id === constructor.id);
            ui.marketList.innerHTML += createMarketItemHTML(constructor, 'constructor', isSelected);
        });

        attachMarketEvents();
    };

    const createMarketItemHTML = (item, type, isSelected) => {
        const btnClass = isSelected ? 'btn-remove' : 'btn-add';
        const btnText = isSelected ? '-' : '+';
        const disabled = isSelected ? '' : (budget < item.price ? 'disabled' : ''); // Deshabilita si no hay plata

        return `
            <div class="market-item ${isSelected ? 'selected' : ''}">
                <div class="market-item-info">
                    <strong>${item.name}</strong>
                    <span>${type === 'driver' ? item.team : 'Escudería'}</span>
                </div>
                <div class="market-item-action">
                    <span class="price">$${item.price.toFixed(1)}M</span>
                    <button class="${btnClass}" data-id="${item.id}" data-type="${type}" data-price="${item.price}" ${disabled}>${btnText}</button>
                </div>
            </div>
        `;
    };

    // ==========================================
    // 2. LÓGICA DE SELECCIÓN (AGREGAR / QUITAR)
    // ==========================================
    const attachMarketEvents = () => {
        const buttons = ui.marketList.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                const price = parseFloat(e.target.getAttribute('data-price'));
                const isAdding = e.target.classList.contains('btn-add');

                if (isAdding) {
                    addItemToTeam(id, type, price);
                } else {
                    removeItemFromTeam(id, type, price);
                }
            });
        });
    };

    const addItemToTeam = (id, type, price) => {
        if (budget < price) return alert('Presupuesto insuficiente.');

        if (type === 'driver') {
            if (selectedDrivers.length >= MAX_DRIVERS) return alert('Ya seleccionaste 5 pilotos.');
            const driver = marketData.drivers.find(d => d.id === id);
            selectedDrivers.push(driver);
        } else {
            if (selectedConstructors.length >= MAX_CONSTRUCTORS) return alert('Ya seleccionaste 2 escuderías.');
            const constructor = marketData.constructors.find(c => c.id === id);
            selectedConstructors.push(constructor);
        }

        budget -= price;
        updateUI();
    };

    const removeItemFromTeam = (id, type, price) => {
        if (type === 'driver') {
            selectedDrivers = selectedDrivers.filter(d => d.id !== id);
        } else {
            selectedConstructors = selectedConstructors.filter(c => c.id !== id);
        }

        budget += price;
        updateUI();
    };

    // ==========================================
    // 3. ACTUALIZAR INTERFAZ Y SLOTS
    // ==========================================
    const updateUI = () => {
        // 1. Actualizar textos de arriba
        ui.budget.textContent = `$${budget.toFixed(1)}M`;
        const totalSelected = selectedDrivers.length + selectedConstructors.length;
        ui.slots.textContent = `${totalSelected}/7`;

        // 2. Habilitar/Deshabilitar botón de guardar
        if (selectedDrivers.length === MAX_DRIVERS && selectedConstructors.length === MAX_CONSTRUCTORS) {
            ui.saveBtn.disabled = false;
        } else {
            ui.saveBtn.disabled = true;
        }

        // 3. Dibujar las tarjetas en la cancha (Roster)
        updateRosterSlots(ui.driverSlots, selectedDrivers);
        updateRosterSlots(ui.constructorSlots, selectedConstructors);

        // 4. Volver a renderizar el mercado para actualizar botones (+ / - y deshabilitados por precio)
        renderMarket();
    };

    const updateRosterSlots = (slotsNodeList, selectedItemsArray) => {
        slotsNodeList.forEach((slot, index) => {
            const item = selectedItemsArray[index];
            if (item) {
                // Slot ocupado
                slot.classList.remove('empty');
                slot.classList.add('filled');
                slot.innerHTML = `
                    <div class="roster-item-content">
                        <strong>${item.name}</strong>
                    </div>
                `;
                // Permitir quitarlo haciendo clic en la tarjeta
                slot.onclick = () => removeItemFromTeam(item.id, item.type || 'driver', item.price);
            } else {
                // Slot vacío
                slot.classList.add('empty');
                slot.classList.remove('filled');
                slot.innerHTML = `<span class="plus-icon">+</span>`;
                slot.onclick = null; // Quitar evento
            }
        });
    };

    // ==========================================
    // 4. GUARDAR EQUIPO
    // ==========================================
    ui.saveBtn.addEventListener('click', async () => {
        const originalText = ui.saveBtn.textContent;
        ui.saveBtn.textContent = 'Guardando...';
        ui.saveBtn.disabled = true;

        try {
            const response = await api.saveTeam({
                drivers: selectedDrivers.map(d => d.id),
                constructors: selectedConstructors.map(c => c.id),
                budgetLeft: budget
            });

            if (response.status === 'success') {
                alert(response.message);
                window.location.href = 'my-teams.html'; // Volvemos a la lista de equipos
            }
        } catch (error) {
            alert('Error al guardar el equipo.');
            ui.saveBtn.textContent = originalText;
            ui.saveBtn.disabled = false;
        }
    });

    // Arrancar la app
    loadMarket();
});