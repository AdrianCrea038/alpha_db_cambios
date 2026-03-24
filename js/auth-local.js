// js/ui/menu-lateral.js
const MenuLateral = {
    init: function() {
        this.crearMenu();
        this.configurarEventos();
        this.aplicarVistaInicial();
        this.mostrarMensajeBienvenida();
    },
    
    mostrarMensajeBienvenida: function() {
        // Crear mensaje flotante
        const mensaje = document.createElement('div');
        mensaje.className = 'menu-welcome';
        mensaje.textContent = 'Menú lateral - Haz clic en ☰ para abrirlo';
        document.body.appendChild(mensaje);
        
        // Ocultar después de 15 segundos
        setTimeout(() => {
            mensaje.classList.add('fade-out');
            setTimeout(() => {
                if (mensaje) mensaje.remove();
            }, 500);
        }, 15000);
    },
    
    crearMenu: function() {
        if (document.getElementById('menuLateral')) return;
        
        const menuHTML = `
            <div id="menuLateral" class="menu-lateral collapsed">
                <button class="menu-toggle" id="menuToggleBtn">☰</button>
                <div class="menu-header">
                    <h3>📋 MENÚ</h3>
                </div>
                <div class="menu-botones">
                    <button id="btnBaseDatos" class="menu-btn active">
                        <span class="menu-icon">🗄️</span>
                        <span class="menu-text">Base de Datos</span>
                    </button>
                    <button id="btnConsultas" class="menu-btn">
                        <span class="menu-icon">🔍</span>
                        <span class="menu-text">Consultas</span>
                    </button>
                    <button id="btnTracking" class="menu-btn">
                        <span class="menu-icon">📍</span>
                        <span class="menu-text">Tracking</span>
                        <span class="menu-badge">Próximamente</span>
                    </button>
                </div>
                <div class="menu-footer">
                    <div class="menu-version">Alpha DB v9.0</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', menuHTML);
        this.agregarEstilos();
        
        // Ajustar el container para que no se superponga al menú colapsado
        const container = document.querySelector('.container');
        if (container) {
            container.style.marginLeft = '0';
            container.style.maxWidth = '100%';
        }
    },
    
    agregarEstilos: function() {
        // Los estilos ya están en styles.css
    },
    
    toggleMenu: function() {
        const menu = document.getElementById('menuLateral');
        const toggleBtn = document.getElementById('menuToggleBtn');
        const container = document.querySelector('.container');
        
        if (menu) {
            menu.classList.toggle('collapsed');
            
            if (menu.classList.contains('collapsed')) {
                toggleBtn.innerHTML = '☰';
                toggleBtn.title = 'Mostrar menú';
                if (container) {
                    container.style.marginLeft = '0';
                    container.style.maxWidth = '100%';
                }
            } else {
                toggleBtn.innerHTML = '✕';
                toggleBtn.title = 'Ocultar menú';
                if (container) {
                    container.style.marginLeft = '280px';
                    container.style.maxWidth = 'calc(100% - 280px)';
                }
            }
        }
    },
    
    configurarEventos: function() {
        const toggleBtn = document.getElementById('menuToggleBtn');
        if (toggleBtn) {
            toggleBtn.onclick = () => this.toggleMenu();
        }
        
        document.getElementById('btnBaseDatos')?.addEventListener('click', () => this.mostrarBaseDatos());
        document.getElementById('btnConsultas')?.addEventListener('click', () => this.mostrarConsultas());
        document.getElementById('btnTracking')?.addEventListener('click', () => {
            Notifications.info('📍 Módulo de Tracking en desarrollo');
        });
    },
    
    mostrarBaseDatos: function() {
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btnBaseDatos').classList.add('active');
        document.getElementById('consultasPanel')?.classList.remove('active');
        
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        const tableSection = document.querySelector('.table-section');
        
        if (formSection) formSection.style.display = 'block';
        if (filtersSection) filtersSection.style.display = 'block';
        if (tableSection) tableSection.style.display = 'block';
        
        AppState.setFiltros('', '');
        if (TablaUI) TablaUI.actualizar();
        Notifications.info('🗄️ Vista de Base de Datos completa');
    },
    
    mostrarConsultas: function() {
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btnConsultas').classList.add('active');
        
        if (!document.getElementById('consultasPanel')) this.crearPanelConsultas();
        
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        if (formSection) formSection.style.display = 'none';
        if (filtersSection) filtersSection.style.display = 'none';
        
        document.getElementById('consultasPanel')?.classList.add('active');
        const tableSection = document.querySelector('.table-section');
        if (tableSection) tableSection.style.display = 'block';
        
        this.aplicarVistaUltimasSemanas();
        Notifications.info('🔍 Vista de Consultas - Últimas 2 semanas');
    },
    
    crearPanelConsultas: function() {
        const tableSection = document.querySelector('.table-section');
        if (!tableSection) return;
        
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
        
        filtrarBtn?.addEventListener('click', () => {
            this.aplicarFiltrosConsulta(searchInput?.value || '', semanaSelect?.value || '');
        });
        limpiarBtn?.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (semanaSelect) semanaSelect.value = '';
            this.aplicarVistaUltimasSemanas();
        });
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.aplicarFiltrosConsulta(searchInput.value, semanaSelect?.value || '');
            }
        });
    },
    
    cargarOpcionesSemanas: function() {
        const semanaSelect = document.getElementById('consultaSemanaSelect');
        if (!semanaSelect) return;
        const semanas = [...new Set(AppState.registros.map(r => r.semana))].sort((a,b) => b - a);
        semanaSelect.innerHTML = '<option value="">Todas las semanas</option>' + semanas.map(s => `<option value="${s}">Semana ${s}</option>`).join('');
    },
    
    actualizarInfoSemanaActual: function() {
        const infoDiv = document.getElementById('infoSemanaActual');
        if (!infoDiv) return;
        const fecha = new Date();
        infoDiv.innerHTML = `📅 Semana actual: ${Utils.obtenerSemana(fecha)} | Fecha: ${Utils.formatearFecha(fecha.toISOString().split('T')[0])}`;
    },
    
    aplicarVistaUltimasSemanas: function() {
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
        
        if (TablaUI) {
            const filtrosGuardados = { search: AppState.currentSearch, semana: AppState.currentSemana };
            AppState.setFiltros('', '');
            TablaUI.render(registrosFiltrados);
            AppState.setFiltros(filtrosGuardados.search, filtrosGuardados.semana);
        }
        
        const infoFiltro = document.getElementById('infoFiltroActivo');
        if (infoFiltro) {
            infoFiltro.innerHTML = `📊 Mostrando registros de las últimas 2 semanas (Semana ${semanaHace14Dias} - Semana ${semanaActual})`;
        }
        if (TablaUI) TablaUI.actualizarEstadisticas();
    },
    
    aplicarFiltrosConsulta: function(search, semana) {
        AppState.setFiltros(search, semana);
        if (TablaUI) TablaUI.actualizar();
        
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

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => MenuLateral.init(), 500);
});

window.MenuLateral = MenuLateral;
