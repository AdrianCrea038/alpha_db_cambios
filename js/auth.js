// ============================================================
// js/auth.js - Módulo de Autenticación con Supabase
// Versión: Valida usuarios DIRECTAMENTE desde Supabase
// ============================================================

const AUTH_CONFIG = {
    sessionDuration: {
        recordar: 30 * 24 * 60 * 60 * 1000,
        normal: 24 * 60 * 60 * 1000
    }
};

// ============================================================
// VALIDAR USUARIO DIRECTAMENTE EN SUPABASE
// ============================================================

async function validarCredenciales(username, password) {
    // Inicializar Supabase si es necesario
    if (window.SupabaseClient && !window.SupabaseClient.client) {
        window.SupabaseClient.init();
    }
    
    if (!window.SupabaseClient || !window.SupabaseClient.client) {
        console.error('❌ Supabase no disponible');
        return null;
    }
    
    try {
        // Buscar usuario por username en Supabase
        const { data, error } = await window.SupabaseClient.client
            .from('usuarios')
            .select('*')
            .eq('username', username.toUpperCase());
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            const usuario = data[0];
            // Verificar contraseña
            if (usuario.password === password) {
                console.log('✅ Usuario validado en Supabase:', usuario.username);
                return usuario;
            }
        }
        
        console.log('❌ Usuario no encontrado en Supabase');
        return null;
    } catch (error) {
        console.error('Error validando credenciales:', error);
        return null;
    }
}

// ============================================================
// CARGAR USUARIOS DESDE SUPABASE (para admin)
// ============================================================

async function cargarUsuarios() {
    if (window.SupabaseClient && window.SupabaseClient.client) {
        try {
            const { data, error } = await window.SupabaseClient.client
                .from('usuarios')
                .select('*')
                .order('creado', { ascending: true });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Guardar copia local para respaldo
                localStorage.setItem('alpha_db_usuarios', JSON.stringify(data));
                console.log('📦 Usuarios cargados desde Supabase:', data.length);
                return data;
            }
        } catch (error) {
            console.error('Error cargando usuarios desde Supabase:', error);
        }
    }
    
    // Fallback a localStorage
    const usuariosGuardados = localStorage.getItem('alpha_db_usuarios');
    if (usuariosGuardados) {
        console.log('📦 Usuarios cargados desde localStorage');
        return JSON.parse(usuariosGuardados);
    }
    
    return [];
}

function getUsuariosSync() {
    const usuariosGuardados = localStorage.getItem('alpha_db_usuarios');
    if (usuariosGuardados) {
        return JSON.parse(usuariosGuardados);
    }
    return [];
}

// ============================================================
// SESIÓN
// ============================================================

function verificarSesion() {
    const session = localStorage.getItem('alpha_db_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            const expiracion = new Date(data.expiracion);
            if (expiracion > new Date()) {
                return data;
            } else {
                localStorage.removeItem('alpha_db_session');
            }
        } catch(e) {
            localStorage.removeItem('alpha_db_session');
        }
    }
    return null;
}

function guardarSesion(usuario, recordar) {
    const sessionData = {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        procesosAsignados: usuario.procesos_asignados || [],
        fecha: new Date().toISOString(),
        expiracion: new Date(Date.now() + (recordar ? AUTH_CONFIG.sessionDuration.recordar : AUTH_CONFIG.sessionDuration.normal)).toISOString()
    };
    localStorage.setItem('alpha_db_session', JSON.stringify(sessionData));
}

function cerrarSesion() {
    localStorage.removeItem('alpha_db_session');
    window.location.href = 'login.html';
}

function getUsuarioActual() {
    const session = verificarSesion();
    if (session) {
        return session;
    }
    return null;
}

// ============================================================
// PERMISOS POR ROL
// ============================================================

function esAdmin() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

function esOperador() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'operador';
}

function esUsuarioTracking() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'usuario_tracking';
}

function esConsultor() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'consultor';
}

function puedeEditar() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');
}

function puedeEliminar() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');
}

function puedeAccederConfiguracion() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

function puedeVerFormulario() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');
}

function puedeAccederBaseDatos() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');
}

function puedeAccederConsultas() {
    const usuario = getUsuarioActual();
    return usuario !== null;
}

function puedeAccederTracking() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador' || usuario.rol === 'usuario_tracking');
}

function puedeAvanzarProceso(proceso) {
    const usuario = getUsuarioActual();
    if (!usuario) return false;
    if (usuario.rol === 'admin' || usuario.rol === 'usuario_tracking') return true;
    if (usuario.rol === 'operador') {
        return (usuario.procesosAsignados || []).includes(proceso);
    }
    return false;
}

function getProcesosPermitidos() {
    const usuario = getUsuarioActual();
    if (!usuario) return [];
    if (usuario.rol === 'admin' || usuario.rol === 'usuario_tracking') {
        return ['DISEÑO', 'PLOTTER', 'SUBLIMADO', 'FLAT', 'LASER', 'BORDADO'];
    }
    if (usuario.rol === 'operador') {
        return usuario.procesosAsignados || [];
    }
    return [];
}

function puedeAccederAprobaciones() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');
}

function puedeAccederBandeja() {
    const usuario = getUsuarioActual();
    return usuario && (usuario.rol === 'admin' || usuario.rol === 'operador' || usuario.rol === 'usuario_tracking');
}

function getNombreRol() {
    const usuario = getUsuarioActual();
    if (!usuario) return '';
    switch(usuario.rol) {
        case 'admin': return '👑 Administrador';
        case 'operador': return '👤 Operador';
        case 'usuario_tracking': return '📍 Usuario Tracking';
        case 'consultor': return '👁️ Consultor';
        default: return '👤 Usuario';
    }
}

// ============================================================
// EXPORTAR
// ============================================================

window.cerrarSesion = cerrarSesion;
window.verificarSesion = verificarSesion;
window.getUsuarioActual = getUsuarioActual;
window.esAdmin = esAdmin;
window.esOperador = esOperador;
window.esUsuarioTracking = esUsuarioTracking;
window.esConsultor = esConsultor;
window.puedeEditar = puedeEditar;
window.puedeEliminar = puedeEliminar;
window.puedeAccederConfiguracion = puedeAccederConfiguracion;
window.puedeVerFormulario = puedeVerFormulario;
window.puedeAccederBaseDatos = puedeAccederBaseDatos;
window.puedeAccederConsultas = puedeAccederConsultas;
window.puedeAccederTracking = puedeAccederTracking;
window.puedeAvanzarProceso = puedeAvanzarProceso;
window.getProcesosPermitidos = getProcesosPermitidos;
window.puedeAccederAprobaciones = puedeAccederAprobaciones;
window.puedeAccederBandeja = puedeAccederBandeja;
window.getNombreRol = getNombreRol;
window.cargarUsuarios = cargarUsuarios;
window.getUsuariosSync = getUsuariosSync;

// ============================================================
// INICIALIZAR LOGIN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('login.html')) {
        console.log('🔐 Página de login cargada');
        
        // Inicializar Supabase
        if (window.SupabaseClient) {
            window.SupabaseClient.init();
        }
        
        const session = verificarSesion();
        if (session) {
            window.location.href = 'index.html';
            return;
        }
        
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
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Mostrar loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '🔄 VERIFICANDO...';
            submitBtn.disabled = true;
            
            // Validar contra Supabase
            const usuario = await validarCredenciales(username, password);
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            if (usuario) {
                if (rememberMeCheck.checked) {
                    localStorage.setItem('alpha_db_remembered_user', username);
                } else {
                    localStorage.removeItem('alpha_db_remembered_user');
                }
                guardarSesion(usuario, rememberMeCheck.checked);
                window.location.href = 'index.html';
            } else {
                mostrarError('Usuario o contraseña incorrectos');
                passwordInput.value = '';
            }
        });
        
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarError('Contacte al administrador para recuperar su contraseña');
        });
        
        function mostrarError(mensaje) {
            const errorExistente = document.querySelector('.error-message');
            if (errorExistente) errorExistente.remove();
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = mensaje;
            loginForm.insertAdjacentElement('afterend', errorDiv);
            
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
});

console.log('✅ auth.js cargado - Validación directa contra Supabase');
