document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const BUDGET_LIMIT = 100.0;
    const MAX_DRIVERS = 5;
    const MAX_CONSTRUCTORS = 2;

    const mode = document.body.dataset.mode; // "create" o "manage"
    const teamId = new URLSearchParams(window.location.search).get('teamId');

    const budgetValueEl = document.getElementById('budgetValue');
    const slotsCountEl = document.getElementById('slotsCount');
    const teamNameInput = document.getElementById('teamNameInput');
    const errorEl = document.getElementById('builderError');
    const marketListEl = document.getElementById('marketList');
    const saveBtn = document.getElementById('saveTeamBtn');

    const DRIVER_IMAGES = {
    "Rafael Câmara": "rafael_camara.jpeg",
    "Joshua Dürksen": "joshua_durksen.avif",
    "Ritomo Miyata": "ritomo_miyata.jpg",
    "Colton Herta": "colton_herta.webp",
    "Noel Leon": "noel_leon.png",
    "Nikola Tsolov": "nikola_tsolov.webp",
    "Dino Beganovic": "dino_beganovic.jpg",
    "Roman Bilinski": "roman_bilinski.jpg",
    "Gabriele Mini": "gabriele_mini.webp",
    "Oliver Goethe": "oliver_goethe.jpg",
    "Sebastian Montoya": "sebastian_montoya.jpg",
    "Mari Boya": "mari_boya.jpg",
    "Martinius Stenshorne": "martinius_stenshorne.webp",
    "Alexander Dunne": "alexander_dunne.webp",
    "Kush Maini": "kush_maini.avif",
    "Tasanapol Inthraphuvasak": "tasanapol_inthraphuvasak.webp",
    "Emerson Fittipaldi": "emerson_fanuchi.jpg",
    "Cian Shields": "cian_shields.webp",
    "Nico Varrone": "nicolas_varrone.jpg",
    "Rafael Villagomez": "rafael_villagomez.png",
    "Laurens van Hoepen": "laurens_van_hoepen.webp",
    "John Bennett": "john_bennett.webp"
    };

    function getDriverImage(driverName) {
        if (DRIVER_IMAGES[driverName]) {
        return `./img/${DRIVER_IMAGES[driverName]}`;
        }
        return null;
    }
    
    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    function hideError() {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
    }
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    // El modo "manage" necesita saber qué equipo editar. Sin eso no hay
    // nada que hacer acá (y NO lo tratamos como si fuera "crear uno nuevo").
    if (mode === 'manage' && !teamId) {
        showError('No se especificó qué equipo editar.');
        saveBtn.disabled = true;
        teamNameInput.disabled = true;
        return;
    }

    let allDrivers = [];
    let allConstructors = [];
    let selectedDriverIds = [];
    let selectedConstructorIds = [];

    // --- Carga inicial ---
    try {
        [allDrivers, allConstructors] = await Promise.all([Api.f2.getDrivers(), Api.f2.getConstructors()]);
    } catch (error) {
        showError('No se pudo cargar el mercado: ' + error.message);
        return;
    }

    if (mode === 'manage') {
        try {
            const team = await Api.teams.getById(teamId);
            teamNameInput.value = team.name;
            teamNameInput.disabled = true; // no hay forma de renombrar un equipo todavía
            selectedDriverIds = team.drivers.map(d => d.id);
            selectedConstructorIds = team.constructors.map(c => c.id);
        } catch (error) {
            showError('No se pudo cargar el equipo: ' + error.message);
            return;
        }
    }

    render();

    // --- Cálculos ---
    function calculateCost() {
        const driversCost = allDrivers.filter(d => selectedDriverIds.includes(d.id)).reduce((sum, d) => sum + d.market_price, 0);
        const constructorsCost = allConstructors.filter(c => selectedConstructorIds.includes(c.id)).reduce((sum, c) => sum + c.market_price, 0);
        return driversCost + constructorsCost;
    }

    // --- Render ---
    function render() {
        renderRosterSlots();
        renderMarket();
        renderBudgetAndSlots();
        renderSaveButtonState();
    }

    function renderBudgetAndSlots() {
        const remaining = BUDGET_LIMIT - calculateCost();
        budgetValueEl.textContent = `$${remaining.toFixed(1)}M`;
        const totalSelected = selectedDriverIds.length + selectedConstructorIds.length;
        slotsCountEl.textContent = `${totalSelected}/7`;
    }

    function renderRosterSlots() {
        document.querySelectorAll('.driver-slot').forEach((slotEl, i) => {
            const driver = allDrivers.find(d => d.id === selectedDriverIds[i]);
            fillSlot(slotEl, driver, 'driver');
        });
        document.querySelectorAll('.constructor-slot').forEach((slotEl, i) => {
            const constructor = allConstructors.find(c => c.id === selectedConstructorIds[i]);
            fillSlot(slotEl, constructor, 'constructor');
        });
    }

    function fillSlot(slotEl, item, type) {
        if (!item) {
            slotEl.classList.add('empty');
            slotEl.disabled = true;
            slotEl.onclick = null;
            slotEl.innerHTML = '<span class="plus-icon">+</span>';
            return;
        }

        slotEl.classList.remove('empty');
        slotEl.disabled = false;

        const imgSrc = type === 'driver' ? getDriverImage(item.name) : null;

        if (imgSrc) {
            // Tarjeta con Imagen para Pilotos
            slotEl.innerHTML = `
                <img src="${imgSrc}" alt="${escapeHtml(item.name)}" class="slot-bg-img">
                <div class="slot-hover-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>$${item.market_price.toFixed(1)}M</span>
                </div>
            `;
        } else {
            // Fallback por defecto (para escuderías o pilotos sin foto)
            slotEl.innerHTML = `
                <div class="slot-hover-info" style="opacity: 1; background: transparent;">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>$${item.market_price.toFixed(1)}M</span>
                </div>
            `;
        }

        slotEl.onclick = () => {
            if (type === 'driver') {
                selectedDriverIds = selectedDriverIds.filter(id => id !== item.id);
            } else {
                selectedConstructorIds = selectedConstructorIds.filter(id => id !== item.id);
            }
            hideError();
            render();
        };
    }

    function renderMarket() {
        marketListEl.innerHTML = '';
        const availableDrivers = allDrivers.filter(d => !selectedDriverIds.includes(d.id));
        const availableConstructors = allConstructors.filter(c => !selectedConstructorIds.includes(c.id));

        availableDrivers.forEach(driver => {
            const constructorName = allConstructors.find(c => c.id === driver.constructor_id)?.name || '';
            marketListEl.appendChild(renderMarketItem(driver, 'driver', constructorName));
        });
        availableConstructors.forEach(constructor => {
            marketListEl.appendChild(renderMarketItem(constructor, 'constructor', 'Escudería'));
        });
    }

    function renderMarketItem(item, type, subtitle) {
        const remaining = BUDGET_LIMIT - calculateCost();
        const atLimit = type === 'driver'
            ? selectedDriverIds.length >= MAX_DRIVERS
            : selectedConstructorIds.length >= MAX_CONSTRUCTORS;
        const tooExpensive = item.market_price > remaining;
        const disabled = atLimit || tooExpensive;

        const div = document.createElement('div');
        div.className = 'market-item';
        div.innerHTML = `
            <div class="market-item-info">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(subtitle)}</span>
            </div>
            <div class="market-item-action">
                <span class="price">$${item.market_price.toFixed(1)}M</span>
                <button class="btn-add" ${disabled ? 'disabled' : ''}>+</button>
            </div>
        `;
        div.querySelector('.btn-add').addEventListener('click', () => {
            if (type === 'driver') selectedDriverIds.push(item.id);
            else selectedConstructorIds.push(item.id);
            hideError();
            render();
        });
        return div;
    }

    function renderSaveButtonState() {
        const ready = selectedDriverIds.length === MAX_DRIVERS && selectedConstructorIds.length === MAX_CONSTRUCTORS;
        saveBtn.disabled = !ready;
    }

    // --- Guardar ---
    saveBtn.addEventListener('click', async () => {
        hideError();

        if (mode === 'create' && !teamNameInput.value.trim()) {
            showError('Ponele un nombre a tu equipo.');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        try {
            let targetTeamId = teamId;
            if (mode === 'create') {
                const created = await Api.teams.create({ name: teamNameInput.value.trim() });
                targetTeamId = created.team.id;
            }
            await Api.teams.updateRoster(targetTeamId, {
                driver_ids: selectedDriverIds,
                constructor_ids: selectedConstructorIds
            });
            window.location.href = 'my-teams';
        } catch (error) {
            showError(error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Equipo';
        }
    });
});