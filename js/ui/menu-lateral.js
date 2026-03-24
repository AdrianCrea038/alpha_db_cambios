// js/ui/menu-lateral.js - VERSIÓN COMPLETA CON NUEVOS BOTONES
const MenuLateral = {
    init: function() {
        if (window.location.pathname.includes('login.html') || window.location.pathname === '/' || window.location.pathname === '') {
            console.log('Menú no disponible en página de login');
            return;
        }
        
        this.crearMenu();
        this.configurarEventos();
        this.aplicarVistaInicial();
    },
    
    crearMenu: function() {
        if (window.location.pathname.includes('login.html')) return;
        if (document.getElementById('menuLateral')) return;
        
        const menuHTML = `
            <div id="menuLateral" class="menu-lateral">
                <button class="menu-toggle" id="menuToggleBtn">◀</button>
                <div class="menu-header">
                    <h3>📋 MENÚ</h3>
                </div>
                <div class="menu-botones">
                    <button id="btnBaseDatos" class="menu-btn active">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                                <rect x="3" y="3" width="18" height="18" rx="2" fill="none"/>
                                <line x1="3" y1="9" x2="21" y2="9"/>
                                <line x1="3" y1="15" x2="21" y2="15"/>
                                <line x1="9" y1="3" x2="9" y2="21"/>
                                <line x1="15" y1="3" x2="15" y2="21"/>
                            </svg>
                        </span>
                        <span class="menu-text">Base de Datos</span>
                    </button>
                    <button id="btnConsultas" class="menu-btn">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                                <circle cx="11" cy="11" r="8" fill="none"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </span>
                        <span class="menu-text">Consultas</span>
                    </button>
                    <button id="btnTracking" class="menu-btn">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                                <path d="M12 2 L12 6 M12 18 L12 22 M4 12 L8 12 M16 12 L20 12" stroke="currentColor"/>
                                <circle cx="12" cy="12" r="3" fill="none"/>
                                <circle cx="12" cy="12" r="8" fill="none"/>
                            </svg>
                        </span>
                        <span class="menu-text">Tracking</span>
                    </button>
                    <button id="btnSolicitudes" class="menu-btn">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                                <path d="M22 6.5L12 13L2 6.5M22 6.5L12 13L2 6.5M2 6.5L12 13L2 6.5Z" fill="none"/>
                                <path d="M12 13V21M2 6.5V17.5C2 18.3 2.5 19 3.2 19.4L12 22L20.8 19.4C21.5 19 22 18.3 22 17.5V6.5" fill="none"/>
                            </svg>
                        </span>
                        <span class="menu-text">Solicitudes</span>
                        <span class="menu-badge">🚧</span>
                    </button>
                    <button id="btnAprobaciones" class="menu-btn">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                                <path d="M22 11.1C22 16.5 17.5 20 12 20C6.5 20 2 16.5 2 11.1C2 6.8 6 2.5 12 2.5C18 2.5 22 6.8 22 11.1Z" fill="none"/>
                                <path d="M8 12L11 15L16 9" stroke="currentColor" fill="none"/>
                            </svg>
                        </span>
                        <span class="menu-text">Aprobaciones piso</span>
                        <span class="menu-badge">🚧</span>
                    </button>
                </div>
                <div class="menu-footer">
                    <div class="menu-version">Alpha DB v9.0</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', menuHTML);
        
        const container = document.querySelector('.container');
        if (container) {
            container.style.marginLeft = '260px';
            container.style.maxWidth = 'calc(100% - 260px)';
        }
    },
    
    toggleMenu: function() {
        const menu = document.getElementById('menuLateral');
        const toggleBtn = document.getElementById('menuToggleBtn');
        const container = document.querySelector('.container');
        
        if (menu) {
            menu.classList.toggle('collapsed');
            
            if (menu.classList.contains('collapsed')) {
                if (toggleBtn) toggleBtn.innerHTML = '▶';
                if (container) {
                    container.style.marginLeft = '60px';
                    container.style.maxWidth = 'calc(100% - 60px)';
                }
            } else {
                if (toggleBtn) toggleBtn.innerHTML = '◀';
                if (container) {
                    container.style.marginLeft = '260px';
                    container.style.maxWidth = 'calc(100% - 260px)';
                }
            }
        }
    },
    
    configurarEventos: function() {
        if (window.location.pathname.includes('login.html')) return;
        
        const toggleBtn = document.getElementById('menuToggleBtn');
        if (toggleBtn) {
            toggleBtn.onclick = () => this.toggleMenu();
        }
        
        const btnBaseDatos = document.getElementById('btnBaseDatos');
        const btnConsultas = document.getElementById('btnConsultas');
        const btnTracking = document.getElementById('btnTracking');
        const btnSolicitudes = document.getElementById('btnSolicitudes');
        const btnAprobaciones = document.getElementById('btnAprobaciones');
        
        if (btnBaseDatos) btnBaseDatos.addEventListener('click', () => this.mostrarBaseDatos());
        if (btnConsultas) btnConsultas.addEventListener('click', () => this.mostrarConsultas());
        if (btnTracking) btnTracking.addEventListener('click', () => this.mostrarTracking());
        if (btnSolicitudes) btnSolicitudes.addEventListener('click', () => this.mostrarSolicitudes());
        if (btnAprobaciones) btnAprobaciones.addEventListener('click', () => this.mostrarAprobaciones());
    },
    
    mostrarBaseDatos: function() {
        const btns = document.querySelectorAll('.menu-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const btnBaseDatos = document.getElementById('btnBaseDatos');
        if (btnBaseDatos) btnBaseDatos.classList.add('active');
        
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.remove('active');
        
        const trackingPanel = document.getElementById('trackingPanel');
        if (trackingPanel) trackingPanel.remove();
        
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        const tableSection = document.querySelector('.table-section');
        
        if (formSection) formSection.style.display = 'block';
        if (filtersSection) filtersSection.style.display = 'block';
        if (tableSection) tableSection.style.display = 'block';
        
        // Modo completo para TablaUI
        if (window.TablaUI && TablaUI.setModo) {
            TablaUI.setModo('completo');
        }
        
        if (window.AppState) {
            AppState.setFiltros('', '');
        }
        if (window.TablaUI && TablaUI.actualizar) {
            TablaUI.actualizar();
        }
        if (window.Notifications) Notifications.info('🗄️ Vista de Base de Datos completa');
    },
    
    mostrarConsultas: function() {
        const btns = document.querySelectorAll('.menu-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const btnConsultas = document.getElementById('btnConsultas');
        if (btnConsultas) btnConsultas.classList.add('active');
        
        const trackingPanel = document.getElementById('trackingPanel');
        if (trackingPanel) trackingPanel.remove();
        
        if (!document.getElementById('consultasPanel')) this.crearPanelConsultas();
        
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        if (formSection) formSection.style.display = 'none';
        if (filtersSection) filtersSection.style.display = 'none';
        
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.add('active');
        
        const tableSection = document.querySelector('.table-section');
        if (tableSection) tableSection.style.display = 'block';
        
        // Modo solo lectura para TablaUI (solo botón historial)
        if (window.TablaUI && TablaUI.setModo) {
            TablaUI.setModo('solo-lectura');
        }
        
        this.aplicarVistaUltimasSemanas();
        if (window.Notifications) Notifications.info('🔍 Vista de Consultas - Solo lectura');
    },
    
    mostrarTracking: function() {
        const btns = document.querySelectorAll('.menu-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const btnTracking = document.getElementById('btnTracking');
        if (btnTracking) btnTracking.classList.add('active');
        
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.remove('active');
        
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        const tableSection = document.querySelector('.table-section');
        
        if (formSection) formSection.style.display = 'none';
        if (filtersSection) filtersSection.style.display = 'none';
        if (tableSection) tableSection.style.display = 'block';
        
        // Modo tracking para TablaUI (solo botón historial)
        if (window.TablaUI && TablaUI.setModo) {
            TablaUI.setModo('tracking');
        }
        
        if (window.TrackingModule && TrackingModule.init) {
            TrackingModule.init();
        } else {
            console.error('TrackingModule no cargado');
            if (window.Notifications) Notifications.error('Error al cargar módulo de Tracking');
        }
        
        if (window.Notifications) Notifications.info('📍 Módulo de Tracking - Buscar por PO');
    },
    
    mostrarSolicitudes: function() {
        const btns = document.querySelectorAll('.menu-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const btnSolicitudes = document.getElementById('btnSolicitudes');
        if (btnSolicitudes) btnSolicitudes.classList.add('active');
        
        // Ocultar paneles existentes
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.remove('active');
        
        const trackingPanel = document.getElementById('trackingPanel');
        if (trackingPanel) trackingPanel.remove();
        
        // Mostrar mensaje de "Próximamente"
        this.mostrarMensajeProximamente('Solicitudes');
        
        if (window.Notifications) Notifications.info('📋 Módulo de Solicitudes - Próximamente disponible');
    },
    
    mostrarAprobaciones: function() {
        const btns = document.querySelectorAll('.menu-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const btnAprobaciones = document.getElementById('btnAprobaciones');
        if (btnAprobaciones) btnAprobaciones.classList.add('active');
        
        // Ocultar paneles existentes
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.remove('active');
        
        const trackingPanel = document.getElementById('trackingPanel');
        if (trackingPanel) trackingPanel.remove();
        
        // Mostrar mensaje de "Próximamente"
        this.mostrarMensajeProximamente('Aprobaciones piso');
        
        if (window.Notifications) Notifications.info('✅ Módulo de Aprobaciones - Próximamente disponible');
    },
    
    mostrarMensajeProximamente: function(titulo) {
        // Eliminar panel existente si hay
        const existingPanel = document.getElementById('proximamentePanel');
        if (existingPanel) existingPanel.remove();
        
        const tableSection = document.querySelector('.table-section');
        if (!tableSection) return;
        
        const panelHTML = `
            <div id="proximamentePanel" class="consultas-panel" style="display:block; text-align:center; padding:3rem;">
                <div style="font-size:4rem; margin-bottom:1rem;">🚧</div>
                <h3 style="color:#ff6b8a; margin-bottom:1rem;">${titulo}</h3>
                <p style="color:rgba(255,255,255,0.7); margin-bottom:1rem;">Esta sección está en desarrollo</p>
                <p style="color:#ffd93d; font-size:0.8rem;">Próximamente disponible</p>
            </div>
        `;
        
        tableSection.insertAdjacentHTML('beforebegin', panelHTML);
        
        // Ocultar tabla si está visible
        const tableSectionContent = document.querySelector('.table-section');
        if (tableSectionContent) tableSectionContent.style.display = 'none';
    },
    
    crearPanelConsultas: function() {
        const tableSection = document.querySelector('.table-section');
        if (!tableSection) return;
        
        if (document.getElementById('consultasPanel')) return;
        
        tableSection.insertAdjacentHTML('beforebegin', `
            <div id="consultasPanel" class="consultas-panel">
                <div class="consultas-header">
                    <h3>🔍 CONSULTAS Y FILTROS</h3>
                    <div class="info-semana" id="infoSemanaActual"></div>
                </div>
                <div class="consultas-filtros">
                    <input type="text" id="consultaSearchInput" placeholder="Buscar por PO, estilo, tela, proceso...">
                    <select id="consultaSemanaSelect"><option value="">Todas las semanas</option></select>
                    <button id="consultaFiltrarBtn" class="btn-filtrar">🔍 Buscar</button>
                    <button id="consultaLimpiarBtn" class="btn-limpiar">✕ Limpiar</button>
                </div>
                <div class="info-semana" id="infoFiltroActivo"></div>
            </div>
        `);
        
        this.configurarEventosConsultas();
        this.cargarOpcionesSemanas();
        this.actualizarInfoSemanaActual();
    },
    
    configurarEventosConsultas: function() {
        const searchInput = document.getElementById('consultaSearchInput');
        const semanaSelect = document.getElementById('consultaSemanaSelect');
        const filtrarBtn = document.getElementById('consultaFiltrarBtn');
        const limpiarBtn = document.getElementById('consultaLimpiarBtn');
        
        if (filtrarBtn) {
            filtrarBtn.addEventListener('click', () => {
                this.aplicarFiltrosConsulta(searchInput ? searchInput.value : '', semanaSelect ? semanaSelect.value : '');
            });
        }
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (semanaSelect) semanaSelect.value = '';
                this.aplicarVistaUltimasSemanas();
            });
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.aplicarFiltrosConsulta(searchInput.value, semanaSelect ? semanaSelect.value : '');
                }
            });
        }
    },
    
    cargarOpcionesSemanas: function() {
        const semanaSelect = document.getElementById('consultaSemanaSelect');
        if (!semanaSelect || !window.AppState || !AppState.registros) return;
        
        const semanas = [...new Set(AppState.registros.map(r => r.semana))].filter(s => s).sort((a,b) => b - a);
        semanaSelect.innerHTML = '<option value="">Todas las semanas</option>' + semanas.map(s => `<option value="${s}">Semana ${s}</option>`).join('');
    },
    
    actualizarInfoSemanaActual: function() {
        const infoDiv = document.getElementById('infoSemanaActual');
        if (!infoDiv || !window.Utils) return;
        
        const fecha = new Date();
        infoDiv.innerHTML = `📅 Semana actual: ${Utils.obtenerSemana(fecha)} | Fecha: ${Utils.formatearFecha(fecha.toISOString().split('T')[0])}`;
    },
    
    aplicarVistaUltimasSemanas: function() {
        if (!window.AppState || !window.Utils || !window.TablaUI) return;
        
        const fecha = new Date();
        const semanaActual = Utils.obtenerSemana(fecha);
        const hace14Dias = new Date(fecha);
        hace14Dias.setDate(fecha.getDate() - 14);
        const semanaHace14Dias = Utils.obtenerSemana(hace14Dias);
        
        const semanasSet = new Set();
        for (let i = 0; i <= semanaActual - semanaHace14Dias; i++) {
            semanasSet.add(semanaHace14Dias + i);
        }
        const semanasArray = Array.from(semanasSet);
        
        const registrosFiltrados = AppState.registros.filter(reg => semanasArray.includes(parseInt(reg.semana)));
        
        const searchGuardado = AppState.currentSearch;
        const semanaGuardada = AppState.currentSemana;
        
        AppState.setFiltros('', '');
        TablaUI.render(registrosFiltrados);
        
        AppState.setFiltros(searchGuardado, semanaGuardada);
        
        const infoFiltro = document.getElementById('infoFiltroActivo');
        if (infoFiltro) {
            infoFiltro.innerHTML = `📊 Mostrando registros de las últimas 2 semanas (Semana ${semanaHace14Dias} - Semana ${semanaActual})`;
        }
        if (TablaUI.actualizarEstadisticas) TablaUI.actualizarEstadisticas();
    },
    
    aplicarFiltrosConsulta: function(search, semana) {
        if (!window.AppState || !window.TablaUI) return;
        
        AppState.setFiltros(search, semana);
        TablaUI.actualizar();
        
        const infoFiltro = document.getElementById('infoFiltroActivo');
        if (infoFiltro) {
            if (search && semana) infoFiltro.innerHTML = `🔍 Buscando: "${search}" | Semana: ${semana}`;
            else if (search) infoFiltro.innerHTML = `🔍 Buscando: "${search}"`;
            else if (semana) infoFiltro.innerHTML = `📅 Semana: ${semana}`;
            else infoFiltro.innerHTML = `📊 Mostrando todos los registros`;
        }
    },
    
    aplicarVistaInicial: function() {
        this.mostrarBaseDatos();
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('login.html')) {
        setTimeout(() => {
            if (window.MenuLateral && MenuLateral.init) {
                MenuLateral.init();
            }
        }, 500);
    }
});

window.MenuLateral = MenuLateral;
