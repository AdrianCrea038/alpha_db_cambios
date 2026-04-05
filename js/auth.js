// ============================================================
// js/auth.js - Autenticación: SUPABASE primero, LOCAL después
// ============================================================

const AUTH_CONFIG = {
    sessionDuration: {
        recordar: 30 * 24 * 60 * 60 * 1000,
        normal: 24 * 60 * 60 * 1000
    }
};

let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (!window.supabase || !window.SUPABASE_CONFIG) return null;
    supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    return supabaseClient;
}

async function validarCredenciales(username, password) {
    const supabase = initSupabase();
    const usernameUpper = username.toUpperCase();
    
    // 1. BUSCAR EN SUPABASE
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('username', usernameUpper);
            
            if (!error && data && data.length > 0 && data[0].password === password) {
                console.log('✅ Login con Supabase:', data[0].username);
                return data[0];
            }
        } catch(e) {
            console.error('Error en Supabase:', e);
        }
    }
    
    // 2. BUSCAR EN LOCALSTORAGE
    const usuariosLocal = localStorage.getItem('alpha_db_usuarios');
    if (usuariosLocal) {
        const usuarios = JSON.parse(usuariosLocal);
        const usuario = usuarios.find(u => u.username === usernameUpper && u.password === password);
        if (usuario) {
            console.log('✅ Login con localStorage:', usuario.username);
            return usuario;
        }
    }
    
    console.log('❌ Usuario no encontrado:', usernameUpper);
    return null;
}

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
    const duracion = recordar ? 30 : 1;
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + duracion);
    localStorage.setItem('alpha_db_session', JSON.stringify({
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        procesosAsignados: usuario.procesos_asignados || [],
        expiracion: expiracion.toISOString()
    }));
}

function cerrarSesion() {
    localStorage.removeItem('alpha_db_session');
    window.location.href = 'login.html';
}

function getUsuarioActual() {
    return verificarSesion();
}

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

window.cerrarSesion = cerrarSesion;
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

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('login.html')) {
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
            const usuario = await validarCredenciales(
                usernameInput.value.trim(),
                passwordInput.value
            );
            
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

console.log('✅ auth.js cargado - Login con Supabase primero');
