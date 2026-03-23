// js/ui/menu-lateral.js
const MenuLateral = {
    init: function() {
        this.crearMenu();
        this.configurarEventos();
        this.aplicarVistaInicial();
    },
    
    crearMenu: function() {
        // Verificar si el menú ya existe
        if (document.getElementById('menuLateral')) return;
        
        // Crear estructura del menú
        const menuHTML = `
            <div id="menuLateral" class="menu-lateral">
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
        
        // Insertar el menú al final del body
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        
        // Agregar estilos dinámicamente
        this.agregarEstilos();
    },
    
    agregarEstilos: function() {
        const style = document.createElement('style');
        style.textContent = `
            /* Menú Lateral */
            .menu-lateral {
                position: fixed;
                right: 0;
                top: 0;
                width: 280px;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
                border-left: 2px solid #ff6b6b;
                box-shadow: -5px 0 25px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s ease;
                font-family: 'Rubik', sans-serif;
            }
            
            /* Botón para colapsar/expandir (opcional) */
            .menu-toggle {
                position: fixed;
                right: 290px;
                top: 20px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 30px;
                width: 40px;
                height: 40px;
                cursor: pointer;
                z-index: 1001;
                font-size: 20px;
                transition: all 0.3s;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .menu-toggle:hover {
                transform: scale(1.05);
                background: #ff8e8e;
            }
            
            /* Ajuste del contenedor principal cuando el menú está presente */
            .container {
                margin-right: 280px;
                transition: margin-right 0.3s ease;
            }
            
            /* Estado colapsado */
            .menu-lateral.collapsed {
                transform: translateX(100%);
            }
            .menu-lateral.collapsed + .container {
                margin-right: 0;
            }
            
            .menu-header {
                padding: 25px 20px;
                border-bottom: 1px solid rgba(255, 107, 107, 0.3);
                text-align: center;
            }
            .menu-header h3 {
                color: #ffd93d;
                font-size: 1.2rem;
                font-weight: 600;
                margin: 0;
            }
            
            .menu-botones {
                flex: 1;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .menu-btn {
                background: #2a2a2a;
                border: 1px solid rgba(255, 107, 107, 0.3);
                border-radius: 12px;
                padding: 14px 16px;
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 12px;
                text-align: left;
                font-family: 'Rubik', sans-serif;
            }
            .menu-btn:hover {
                background: #3a3a3a;
                border-color: #ff6b6b;
                transform: translateX(-5px);
            }
            .menu-btn.active {
                background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                border-color: #ffd93d;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            }
            .menu-icon {
                font-size: 1.4rem;
            }
            .menu-text {
                flex: 1;
            }
            .menu-badge {
                font-size: 0.65rem;
                background: rgba(255, 107, 107, 0.3);
                padding: 3px 8px;
                border-radius: 20px;
                color: #ffd93d;
            }
            
            .menu-footer {
                padding: 20px;
                border-top: 1px solid rgba(255, 107, 107, 0.3);
                text-align: center;
            }
            .menu-version {
                font-size: 0.7rem;
                color: #888;
            }
            
            /* Panel de consultas */
            .consultas-panel {
                background: #1e1e1e;
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid rgba(255, 107, 107, 0.2);
                display: none;
            }
            .consultas-panel.active {
                display: block;
                animation: fadeIn 0.3s;
            }
            .consultas-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            .consultas-header h3 {
                color: #ffd93d;
                font-size: 1rem;
            }
            .consultas-filtros {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }
            .consultas-filtros input, .consultas-filtros select {
                padding: 10px 15px;
                background: #2a2a2a;
                border: 1px solid #ff6b6b;
                border-radius: 8px;
                color: white;
                font-family: 'Rubik', sans-serif;
            }
            .consultas-filtros input {
                flex: 1;
                min-width: 200px;
            }
            .btn-filtrar {
                background: #ff6b6b;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            .btn-filtrar:hover {
                background: #ff8e8e;
                transform: translateY(-2px);
            }
            .btn-limpiar {
                background: #2a2a2a;
                border: 1px solid #ff6b6b;
                padding: 10px 20px;
                border-radius: 8px;
                color: #ffd93d;
                cursor: pointer;
            }
            .info-semana {
                background: #2a2a2a;
                padding: 10px;
                border-radius: 8px;
                margin-top: 15px;
                font-size: 0.8rem;
                color: #ffd93d;
                text-align: center;
            }
            
            @media (max-width: 768px) {
                .menu-lateral {
                    width: 260px;
                }
                .container {
                    margin-right: 0;
                }
                .menu-toggle {
                    right: 20px;
                }
                .menu-lateral:not(.collapsed) + .container {
                    margin-right: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Agregar botón de colapsar
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'menu-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.title = 'Ocultar menú';
        toggleBtn.onclick = () => this.toggleMenu();
        document.body.insertAdjacentElement('afterbegin', toggleBtn);
    },
    
    toggleMenu: function() {
        const menu = document.getElementById('menuLateral');
        const toggleBtn = document.querySelector('.menu-toggle');
        if (menu) {
            menu.classList.toggle('collapsed');
            toggleBtn.innerHTML = menu.classList.contains('collapsed') ? '☰' : '✕';
            toggleBtn.title = menu.classList.contains('collapsed') ? 'Mostrar menú' : 'Ocultar menú';
        }
    },
    
    configurarEventos: function() {
        const btnBaseDatos = document.getElementById('btnBaseDatos');
        const btnConsultas = document.getElementById('btnConsultas');
        const btnTracking = document.getElementById('btnTracking');
        
        if (btnBaseDatos) {
            btnBaseDatos.addEventListener('click', () => this.mostrarBaseDatos());
        }
        if (btnConsultas) {
            btnConsultas.addEventListener('click', () => this.mostrarConsultas());
        }
        if (btnTracking) {
            btnTracking.addEventListener('click', () => {
                Notifications.info('📍 Módulo de Tracking en desarrollo');
            });
        }
    },
    
    mostrarBaseDatos: function() {
        // Activar botón
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btnBaseDatos').classList.add('active');
        
        // Ocultar panel de consultas
        const consultasPanel = document.getElementById('consultasPanel');
        if (consultasPanel) consultasPanel.classList.remove('active');
        
        // Mostrar formulario principal
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        const tableSection = document.querySelector('.table-section');
        
        if (formSection) formSection.style.display = 'block';
        if (filtersSection) filtersSection.style.display = 'block';
        if (tableSection) tableSection.style.display = 'block';
        
        // Limpiar filtros y mostrar todos los datos
        AppState.setFiltros('', '');
        if (TablaUI) TablaUI.actualizar();
        
        Notifications.info('🗄️ Vista de Base de Datos completa');
    },
    
    mostrarConsultas: function() {
        // Activar botón
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btnConsultas').classList.add('active');
        
        // Crear panel de consultas si no existe
        if (!document.getElementById('consultasPanel')) {
            this.crearPanelConsultas();
        }
        
        // Ocultar formulario principal
        const formSection = document.querySelector('.form-section');
        const filtersSection = document.querySelector('.filters-section');
        
        if (formSection) formSection.style.display = 'none';
        if (filtersSection) filtersSection.style.display = 'none';
        
        // Mostrar panel de consultas
        const consultasPanel = document.getElementById('consultasPanel');
        const tableSection = document.querySelector('.table-section');
        
        if (consultasPanel) consultasPanel.classList.add('active');
        if (tableSection) tableSection.style.display = 'block';
        
        // Aplicar vista de últimas 2 semanas
        this.aplicarVistaUltimasSemanas();
        
        Notifications.info('🔍 Vista de Consultas - Últimas 2 semanas');
    },
    
    crearPanelConsultas: function() {
        const tableSection = document.querySelector('.table-section');
        if (!tableSection) return;
        
        const panelHTML = `
            <div id="consultasPanel" class="consultas-panel">
                <div class="consultas-header">
                    <h3>🔍 CONSULTAS Y FILTROS</h3>
                    <div class="info-semana" id="infoSemanaActual"></div>
                </div>
                <div class="consultas-filtros">
                    <input type="text" id="consultaSearchInput" placeholder="Buscar por PO, estilo, tela, proceso...">
                    <select id="consultaSemanaSelect">
                        <option value="">Todas las semanas</option>
                    </select>
                    <button id="consultaFiltrarBtn" class="btn-filtrar">🔍 Buscar</button>
                    <button id="consultaLimpiarBtn" class="btn-limpiar">✕ Limpiar</button>
                </div>
                <div class="info-semana" id="infoFiltroActivo"></div>
            </div>
        `;
        
        tableSection.insertAdjacentHTML('beforebegin', panelHTML);
        
        // Configurar eventos del panel
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
                const search = searchInput ? searchInput.value : '';
                const semana = semanaSelect ? semanaSelect.value : '';
                this.aplicarFiltrosConsulta(search, semana);
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
                    const search = searchInput.value;
                    const semana = semanaSelect ? semanaSelect.value : '';
                    this.aplicarFiltrosConsulta(search, semana);
                }
            });
        }
    },
    
    cargarOpcionesSemanas: function() {
        const semanaSelect = document.getElementById('consultaSemanaSelect');
        if (!semanaSelect) return;
        
        // Obtener semanas únicas de los registros
        const semanas = [...new Set(AppState.registros.map(r => r.semana))].sort((a,b) => b - a);
        
        semanaSelect.innerHTML = '<option value="">Todas las semanas</option>';
        semanas.forEach(semana => {
            semanaSelect.innerHTML += `<option value="${semana}">Semana ${semana}</option>`;
        });
    },
    
    actualizarInfoSemanaActual: function() {
        const infoDiv = document.getElementById('infoSemanaActual');
        if (!infoDiv) return;
        
        const fecha = new Date();
        const semanaActual = Utils.obtenerSemana(fecha);
        infoDiv.innerHTML = `📅 Semana actual: ${semanaActual} | Fecha: ${Utils.formatearFecha(fecha.toISOString().split('T')[0])}`;
    },
    
    aplicarVistaUltimasSemanas: function() {
        const fecha = new Date();
        const semanaActual = Utils.obtenerSemana(fecha);
        
        // Calcular semanas de los últimos 14 días (2 semanas)
        const hace14Dias = new Date(fecha);
        hace14Dias.setDate(fecha.getDate() - 14);
        const semanaHace14Dias = Utils.obtenerSemana(hace14Dias);
        
        // Obtener semanas únicas en ese rango
        const semanasSet = new Set();
        for (let i = 0; i <= semanaActual - semanaHace14Dias; i++) {
            semanasSet.add(semanaHace14Dias + i);
        }
        
        const semanasArray = Array.from(semanasSet);
        
        // Filtrar registros por esas semanas
        const registrosFiltrados = AppState.registros.filter(reg => {
            return semanasArray.includes(parseInt(reg.semana));
        });
        
        // Actualizar tabla con los registros filtrados
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
        
        // Actualizar estadísticas
        if (TablaUI) TablaUI.actualizarEstadisticas();
    },
    
    aplicarFiltrosConsulta: function(search, semana) {
        // Aplicar filtros
        AppState.setFiltros(search, semana);
        
        // Actualizar tabla
        if (TablaUI) TablaUI.actualizar();
        
        // Mostrar información del filtro
        const infoFiltro = document.getElementById('infoFiltroActivo');
        if (infoFiltro) {
            let mensaje = '';
            if (search && semana) {
                mensaje = `🔍 Buscando: "${search}" | Semana: ${semana}`;
            } else if (search) {
                mensaje = `🔍 Buscando: "${search}"`;
            } else if (semana) {
                mensaje = `📅 Semana: ${semana}`;
            } else {
                mensaje = `📊 Mostrando todos los registros`;
            }
            infoFiltro.innerHTML = mensaje;
        }
    },
    
    aplicarVistaInicial: function() {
        // Por defecto, mostrar la vista de Base de Datos
        this.mostrarBaseDatos();
    }
};

// Inicializar el menú cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que AppState esté cargado
    setTimeout(function() {
        MenuLateral.init();
    }, 500);
});

window.MenuLateral = MenuLateral;
