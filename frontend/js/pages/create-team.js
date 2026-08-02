// js/create-team.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Identificar contenedores en el DOM
    const marketList = document.getElementById('market-list');
    const budgetAmount = document.getElementById('budget-amount');
    const slotsCount = document.getElementById('slots-count');
    const saveBtn = document.getElementById('save-team-btn');
    
    // Estado interno del equipo (Lógica de F2 Fantasy)
    let currentBudget = 100.0; // Basado en el DEFAULT de init.sql
    let selectedDrivers = [];
    let selectedConstructors = [];
    const MAX_DRIVERS = 5;
    const MAX_CONSTRUCTORS = 2;

    // 2. Cargar los datos desde la API simulada
    const loadMarket = async () => {
        try {
            marketList.innerHTML = '<p>Cargando mercado...</p>';
            
            const response = await api.getMarketData();
            
            if (response.status === 'success') {
                renderMarket(response.data.drivers, response.data.constructors);
            }
        } catch (error) {
            console.error("Error al cargar el mercado", error);
            marketList.innerHTML = '<p>Error al cargar el mercado.</p>';
        }
    };

    // 3. Renderizar las tarjetas en el HTML
    const renderMarket = (drivers, constructors) => {
        marketList.innerHTML = ''; // Limpiamos el contenedor

        // Renderizar Pilotos
        drivers.forEach(driver => {
            const item = document.createElement('div');
            item.className = 'market-item';
            item.innerHTML = `
                <div class="market-item-info">
                    <strong>${driver.name}</strong>
                    <span>${driver.team}</span>
                </div>
                <div class="market-item-action">
                    <span class="price">$${driver.price.toFixed(1)}M</span>
                    <button class="btn-add" data-type="driver" data-id="${driver.id}" data-price="${driver.price}">+</button>
                </div>
            `;
            marketList.appendChild(item);
        });

        // Renderizar Escuderías
        constructors.forEach(constructor => {
            const item = document.createElement('div');
            item.className = 'market-item';
            item.innerHTML = `
                <div class="market-item-info">
                    <strong>${constructor.name}</strong>
                    <span>${constructor.type}</span>
                </div>
                <div class="market-item-action">
                    <span class="price">$${constructor.price.toFixed(1)}M</span>
                    <button class="btn-add" data-type="constructor" data-id="${constructor.id}" data-price="${constructor.price}">+</button>
                </div>
            `;
            marketList.appendChild(item);
        });

        // Agregar Event Listeners a los botones "+"
        attachAddButtons();
    };

    // 4. Lógica para agregar al equipo
    const attachAddButtons = () => {
        const addButtons = document.querySelectorAll('.btn-add');
        
        addButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                const price = parseFloat(e.target.dataset.price);

                // Validaciones básicas de presupuesto y cupo
                if (currentBudget - price < 0) {
                    alert("Presupuesto insuficiente.");
                    return;
                }

                if (type === 'driver' && selectedDrivers.length >= MAX_DRIVERS) {
                    alert("Ya elegiste 5 pilotos.");
                    return;
                }

                if (type === 'constructor' && selectedConstructors.length >= MAX_CONSTRUCTORS) {
                    alert("Ya elegiste 2 escuderías.");
                    return;
                }

                // Descontar presupuesto y sumar al array correspondiente
                currentBudget -= price;
                if (type === 'driver') selectedDrivers.push(id);
                else selectedConstructors.push(id);

                // Actualizar interfaz
                updateUI();
                
                // Deshabilitar botón visualmente
                e.target.disabled = true;
                e.target.textContent = '✓';
            });
        });
    };

    // 5. Actualizar los marcadores de la interfaz
    const updateUI = () => {
        budgetAmount.textContent = `$${currentBudget.toFixed(1)}M`;
        const totalSelected = selectedDrivers.length + selectedConstructors.length;
        slotsCount.textContent = `${totalSelected}/7`;

        // Habilitar botón de guardado si el equipo está completo
        if (selectedDrivers.length === MAX_DRIVERS && selectedConstructors.length === MAX_CONSTRUCTORS) {
            saveBtn.disabled = false;
        }
    };

    // 6. Guardar equipo
    saveBtn.addEventListener('click', async () => {
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;

        const response = await api.saveTeam({
            budgetLeft: currentBudget,
            drivers: selectedDrivers,
            constructors: selectedConstructors
        });

        if (response.status === 'success') {
            alert('¡Tu equipo ha sido creado!');
            window.location.href = 'my-teams.html';
        }
    });

    // Iniciar
    loadMarket();
});