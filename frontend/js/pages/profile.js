// js/pages/profile.js

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos visuales
    const displayName = document.getElementById('display-name');
    const displayUsername = document.getElementById('display-username');
    
    // Referencias a los inputs del formulario de edición
    const editForm = document.getElementById('edit-profile-form');
    const firstNameInput = document.getElementById('firstname');
    const lastNameInput = document.getElementById('lastname');
    
    // Referencia al formulario de contraseña
    const passwordForm = document.getElementById('change-password-form');

    // ==========================================
    // 1. CARGAR DATOS DEL PERFIL
    // ==========================================
    const loadProfile = async () => {
        try {
            const response = await api.getUserProfile();
            
            if (response.status === 'success') {
                const user = response.data;
                
                // Actualizar la tarjeta superior
                displayName.textContent = `${user.firstName} ${user.lastName}`;
                displayUsername.textContent = `@${user.username}`;
                
                // Precompletar los inputs del formulario
                firstNameInput.value = user.firstName;
                lastNameInput.value = user.lastName;
            }
        } catch (error) {
            console.error("Error al cargar el perfil:", error);
            displayName.textContent = 'Error al cargar';
        }
    };

    // ==========================================
    // 2. GUARDAR CAMBIOS DEL PERFIL
    // ==========================================
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = editForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;

        try {
            const response = await api.updateUserProfile({
                firstName: firstNameInput.value,
                lastName: lastNameInput.value
            });

            if (response.status === 'success') {
                alert(response.message);
                // Refrescamos la tarjeta visual
                displayName.textContent = `${firstNameInput.value} ${lastNameInput.value}`;
            }
        } catch (error) {
            alert('Error al guardar los cambios.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // ==========================================
    // 3. ACTUALIZAR CONTRASEÑA
    // ==========================================
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const repeatPassword = document.getElementById('repeat-password').value;

        // Validación rápida en frontend
        if (newPassword !== repeatPassword) {
            return alert('Las contraseñas nuevas no coinciden.');
        }

        const submitBtn = passwordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Actualizando...';
        submitBtn.disabled = true;

        try {
            const response = await api.changePassword({
                currentPassword,
                newPassword,
                repeatPassword
            });

            if (response.status === 'success') {
                alert(response.message);
                passwordForm.reset(); // Vaciamos los inputs
            }
        } catch (error) {
            alert(error.message || 'Error al cambiar la contraseña.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Iniciar carga al abrir la página
    loadProfile();
});