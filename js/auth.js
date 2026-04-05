// ============================================================
// js/auth.js - Módulo de Autenticación
// CORREGIDO: Valida contra Supabase PRIMERO
// ============================================================

const AUTH_CONFIG = {
    sessionDuration: {
        recordar: 30 * 24 * 60 * 60 * 1000,  // 30 días
        normal: 24 * 60 * 60 * 1000          // 24 horas
    }
};

// Cliente Supabase (inicialización diferida)
let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    if (!window.supabase || !window.SUPABASE_CONFIG) {
        console.warn('⚠️ Supabase no disponible');
        return null;
    }
    
    supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    console.log('✅ Supabase cliente inicializado');
    return supabaseClient;
}

// ============================================================
// VALIDACIÓN DE CREDENCIALES - PRIMERO SUPABASE, LUEGO LOCAL
// ============================================================

async function validarCredenciales(username, password) {
    const supabase = initSupabase();
    const usernameUpper = username.toUpperCase();
    
    // 1. INTENTAR EN SUPABASE
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('username', usernameUpper);
            
            if (!error && data && data.length > 0) {
                const usuario = data[0];
                if (usuario.password === password) {
                    console.log('✅ Usuario validado en Supabase:', usuario.username);
                    // Sincronizar con localStorage para futuras consultas
                    const usuariosLocal = JSON.parse(localStorage.getItem('alpha_db_usuarios') || '[]');
                    const exists = usuariosLocal.some(u => u.id === usuario.id);
                    if (!exists) {
                        usuariosLocal.push(usuario);
                        localStorage.setItem('alpha_db_usuarios', JSON.stringify(usuariosLocal));
                    }
                    return usuario;
                }
            }
        } catch (error) {
            console.error('Error consultando Supabase:', error);
        }
    }
    
    // 2. FALLBACK: BUSCAR EN LOCALSTORAGE
    const usuariosGuardados = localStorage.getItem('alpha_db_usuarios');
    if (usuariosGuardados) {
        const usuarios = JSON.parse(usuariosGuardados);
        const usuario = usuarios.find(u => u.username === usernameUpper && u.password === password);
        if (usuario) {
            console.log('✅ Usuario validado en localStorage:', usuario.username);
            return usuario;
        }
    }
    
    console.log('❌ Usuario no encontrado:', usernameUpper);
    return null;
}

// ============================================================
// SINCRONIZAR USUARIOS DESDE SUPABASE (para el panel de admin)
// ============================================================

async function cargarUsuariosDesdeSupabase() {
    const supabase = initSupabase();
    if (!supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('creado', { ascending: true });
        
        if (!error && data) {
            localStorage.setItem('alpha_db_usuarios', JSON.stringify(data));
            console.log('📦 Usuarios sincronizados desde Supabase:', data.length);
            return data;
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
    
    const usuariosLocal = localStorage.getItem('alpha_db_usuarios');
    return usuariosLocal ? JSON.parse(usuariosLocal) : [];
}

// ============================================================
// GESTIÓN DE SESIÓN
// ============================================================

function verificarSesion() {
    const session = localStorage.getItem('alpha_db_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (new Date(data.expiracion) > new Date()) {
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
    const duracionMs = recordar ? AUTH_CONFIG.sessionDuration.recordar : AUTH_CONFIG.sessionDuration.normal;
    const sessionData = {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        procesosAsignados: usuario.procesos_asignados || [],
        fecha: new Date().toISOString(),
        expiracion: new Date(Date.now() + duracionMs).toISOString()
    };
    localStorage.setItem('alpha_db_session', JSON.stringify(sessionData));
}

function cerrarSesion() {
    localStorage.removeItem('alpha_db_session');
    window.location.href = 'login.html';
}

function getUsuarioActual() {
    return verificarSesion();
}

// ============================================================
// FUNCIONES DE PERMISOS POR ROL
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
    return getUsuarioActual() !== null;
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
// EXPORTAR FUNCIONES GLOBALES
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
window.cargarUsuariosDesdeSupabase = cargarUsuariosDesdeSupabase;

// ============================================================
// INICIALIZAR LOGIN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('login.html')) {
        console.log('🔐 Página de login cargada');
        
        // Inicializar Supabase
        initSupabase();
        
        // Verificar sesión existente
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
        
        // Cargar usuario recordado
        const rememberedUser = localStorage.getItem('alpha_db_remembered_user');
        if (rememberedUser) {
            usernameInput.value = rememberedUser;
            rememberMeCheck.checked = true;
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Mostrar estado de carga
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '🔄 VERIFICANDO...';
            submitBtn.disabled = true;
            
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

console.log('✅ auth.js cargado - Validación contra Supabase primero');
