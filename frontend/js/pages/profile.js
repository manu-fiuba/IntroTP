document.addEventListener('DOMContentLoaded', () => {

    // Sin sesión, no hay perfil que mostrar.
    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = Api.session.getUser();

    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');
    const firstNameInput = document.getElementById('firstname');
    const lastNameInput = document.getElementById('lastname');

    function showMessage(el, message) {
        el.textContent = message;
        el.classList.add('visible');
    }
    function hideMessage(el) {
        el.classList.remove('visible');
        el.textContent = '';
    }

    // --- Cargar los datos actuales del usuario ---
    Api.users.getById(currentUser.id)
        .then(user => {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
            nameEl.textContent = fullName || user.username;
            usernameEl.textContent = `@${user.username}`;
            firstNameInput.value = user.first_name || '';
            lastNameInput.value = user.last_name || '';
        })
        .catch(() => {
            nameEl.textContent = currentUser.username;
            usernameEl.textContent = `@${currentUser.username}`;
        });

    // --- Formulario "Editar Datos" ---
    const editForm = document.getElementById('editDataForm');
    const editError = document.getElementById('editDataError');
    const editSuccess = document.getElementById('editDataSuccess');
    const editSubmit = document.getElementById('editDataSubmit');

    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage(editError);
        hideMessage(editSuccess);

        editSubmit.disabled = true;
        editSubmit.textContent = 'Guardando...';

        try {
            const result = await Api.users.update(currentUser.id, {
                first_name: firstNameInput.value.trim(),
                last_name: lastNameInput.value.trim()
            });
            nameEl.textContent = [result.user.first_name, result.user.last_name].filter(Boolean).join(' ') || result.user.username;
            showMessage(editSuccess, result.message);
        } catch (error) {
            showMessage(editError, error.message);
        } finally {
            editSubmit.disabled = false;
            editSubmit.textContent = 'Guardar Cambios';
        }
    });

    // --- Formulario "Cambiar Contraseña" ---
    const passwordForm = document.getElementById('changePasswordForm');
    const passwordError = document.getElementById('changePasswordError');
    const passwordSuccess = document.getElementById('changePasswordSuccess');
    const passwordSubmit = document.getElementById('changePasswordSubmit');

    passwordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage(passwordError);
        hideMessage(passwordSuccess);

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const repeatNewPassword = document.getElementById('repeat-password').value;

        passwordSubmit.disabled = true;
        passwordSubmit.textContent = 'Actualizando...';

        try {
            const result = await Api.users.updatePassword(currentUser.id, {
                currentPassword, newPassword, repeatNewPassword
            });
            showMessage(passwordSuccess, result.message);
            passwordForm.reset();
        } catch (error) {
            showMessage(passwordError, error.message);
        } finally {
            passwordSubmit.disabled = false;
            passwordSubmit.textContent = 'Actualizar Contraseña';
        }
    });
});