// ============================================================
// js/auth.js - Autenticación que busca en Supabase PRIMERO
// ============================================================

const AUTH_CONFIG = {
    sessionDuration: {
        recordar: 30 * 24 * 60 * 60 * 1000,
        normal: 24 * 60 * 60 * 1000
    }
};

// Cliente Supabase
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
    
    console.log('✅ Supabase inicializado');
    return supabaseClient;
}

// ============================================================
// VALIDAR CREDENCIALES - PRIMERO EN SUPABASE, LUEGO LOCAL
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
                    // Sincronizar con localStorage
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
// CARGAR TODOS LOS USUARIOS DESDE SUPABASE
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
// SESIÓN
// ============================================================

function verificarSesion() {
    const session = localStorage.getItem('alpha_db_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (new Date(data.expiracion) > new Date()) {
                return data;
            }
        } catch(e) {}
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
// PERMISOS
// ============================================================

function esAdmin() { const u = getUsuarioActual(); return u && u.rol === 'admin'; }
function esOperador() { const u = getUsuarioActual(); return u && u.rol === 'operador'; }
function esUsuarioTracking() { const u = getUsuarioActual(); return u && u.rol === 'usuario_tracking'; }
function esConsultor() { const u = getUsuarioActual(); return u && u.rol === 'consultor'; }
function puedeEditar() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador'); }
function puedeEliminar() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador'); }
function puedeAccederConfiguracion() { const u = getUsuarioActual(); return u && u.rol === 'admin'; }
function puedeVerFormulario() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador'); }
function puedeAccederBaseDatos() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador'); }
function puedeAccederConsultas() { return getUsuarioActual() !== null; }
function puedeAccederTracking() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador' || u.rol === 'usuario_tracking'); }
function puedeAccederAprobaciones() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador'); }
function puedeAccederBandeja() { const u = getUsuarioActual(); return u && (u.rol === 'admin' || u.rol === 'operador' || u.rol === 'usuario_tracking'); }
function getNombreRol() { const u = getUsuarioActual(); if (!u) return ''; const roles = { 'admin': '👑 Administrador', 'operador': '👤 Operador', 'usuario_tracking': '📍 Usuario Tracking', 'consultor': '👁️ Consultor' }; return roles[u.rol] || '👤 Usuario'; }

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
window.puedeAccederAprobaciones = puedeAccederAprobaciones;
window.puedeAccederBandeja = puedeAccederBandeja;
window.getNombreRol = getNombreRol;
window.cargarUsuariosDesdeSupabase = cargarUsuariosDesdeSupabase;

// ============================================================
// INICIALIZAR LOGIN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('login.html')) {
        console.log('🔐 Login iniciado');
        initSupabase();
        
        if (verificarSesion()) {
            window.location.href = 'index.html';
            return;
        }
        
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeCheck = document.getElementById('rememberMe');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Mostrar loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '🔄 Verificando...';
            submitBtn.disabled = true;
            
            const usuario = await validarCredenciales(username, password);
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            if (usuario) {
                guardarSesion(usuario, rememberMeCheck.checked);
                window.location.href = 'index.html';
            } else {
                alert('❌ Usuario o contraseña incorrectos');
                passwordInput.value = '';
            }
        });
    }
});

console.log('✅ auth.js cargado - Busca en Supabase PRIMERO');
