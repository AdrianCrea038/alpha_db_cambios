// ============================================================
// js/auth.js - Autenticación SIMPLE con Supabase
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
        console.error('❌ Supabase no disponible');
        return null;
    }
    
    supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    console.log('✅ Supabase inicializado');
    return supabaseClient;
}

async function validarCredenciales(username, password) {
    const supabase = initSupabase();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', username.toUpperCase());
        
        if (error) {
            console.error('Error en consulta:', error);
            return null;
        }
        
        if (data && data.length > 0 && data[0].password === password) {
            console.log('✅ Usuario válido:', data[0].username);
            return data[0];
        }
        
        console.log('❌ Usuario o contraseña incorrectos');
        return null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
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
    
    const sessionData = {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        procesosAsignados: usuario.procesos_asignados || [],
        expiracion: expiracion.toISOString()
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

// Permisos
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

// Inicializar login
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
            
            const usuario = await validarCredenciales(username, password);
            
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

console.log('✅ auth.js cargado');
