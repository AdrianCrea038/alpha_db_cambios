// js/auth-local.js
const USUARIO_VALIDO = {
    username: "ALPHA",
    password: "DB2024"
};

const USUARIO_VALIDO_LOWERCASE = {
    username: "alpha",
    password: "db2024"
};

function verificarSesion() {
    const session = localStorage.getItem('alpha_db_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            const expiracion = new Date(data.expiracion);
            if (expiracion > new Date()) {
                window.location.href = 'index.html';
                return true;
            } else {
                localStorage.removeItem('alpha_db_session');
            }
        } catch(e) {
            localStorage.removeItem('alpha_db_session');
        }
    }
    return false;
}

function guardarSesion(recordar) {
    const sessionData = {
        usuario: USUARIO_VALIDO.username,
        fecha: new Date().toISOString()
    };
    
    if (recordar) {
        sessionData.expiracion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else {
        sessionData.expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    
    localStorage.setItem('alpha_db_session', JSON.stringify(sessionData));
}

window.cerrarSesion = function() {
    localStorage.removeItem('alpha_db_session');
    window.location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', function() {
    if (verificarSesion()) return;
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheck = document.getElementById('rememberMe');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    
    const rememberedUser = localStorage.getItem('alpha_db_remembered_user');
    if (rememberedUser) {
        usernameInput.value = rememberedUser;
        rememberMeCheck.checked = true;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        const esValido = (username === USUARIO_VALIDO.username && password === USUARIO_VALIDO.password) ||
                         (username === USUARIO_VALIDO_LOWERCASE.username && password === USUARIO_VALIDO_LOWERCASE.password);
        
        if (esValido) {
            if (rememberMeCheck.checked) {
                localStorage.setItem('alpha_db_remembered_user', username);
            } else {
                localStorage.removeItem('alpha_db_remembered_user');
            }
            guardarSesion(rememberMeCheck.checked);
            window.location.href = 'index.html';
        } else {
            alert('Usuario o contraseña incorrectos');
            passwordInput.value = '';
        }
    });
    
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Credenciales de prueba:\nUsuario: ALPHA\nContraseña: DB2024');
    });
});
