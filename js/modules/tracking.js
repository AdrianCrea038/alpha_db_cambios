// js/modules/tracking.js
const TrackingModule = {
    poActual: null,
    datosPO: null,
    procesos: ['DISEÑO', 'PLOTTER', 'SUBLIMADO', 'FLAT', 'LASER', 'BORDADO'],
    metaPiezas: 500,
    
    piezasPorProceso: {
        'DISEÑO': 500,
        'PLOTTER': 450,
        'SUBLIMADO': 400,
        'FLAT': 350,
        'LASER': 300,
        'BORDADO': 250
    },
    
    init: function() {
        console.log('📍 Módulo de Tracking iniciado');
        this.renderizar();
        this.configurarEventos();
    },
    
    renderizar: function() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        let trackingPanel = document.getElementById('trackingPanel');
        if (trackingPanel) trackingPanel.remove();
        
        const panelHTML = `
            <div id="trackingPanel" class="tracking-panel">
                <div class="tracking-header">
                    <h2>📍 TRACKING DE PRODUCCIÓN</h2>
                    <p>Seguimiento detallado por orden de producción (PO)</p>
                </div>
                
                <div class="tracking-buscador">
                    <div class="buscador-input-group">
                        <input type="text" id="trackingPoInput" placeholder="Ingrese número de PO..." class="input-bonito">
                        <button id="trackingBuscarBtn" class="btn-primary">🔍 BUSCAR</button>
                        <button id="trackingEscanearBtn" class="btn-secondary" style="background: #9c27b0;">📷 ESCANEAR QR</button>
                    </div>
                    <div id="trackingScannerContainer" class="scanner-container" style="display: none;">
                        <video id="trackingVideo" autoplay playsinline></video>
                        <canvas id="trackingCanvas" style="display: none;"></canvas>
                        <button id="trackingCerrarScanner" class="btn-secondary">✕ Cerrar escáner</button>
                    </div>
                </div>
                
                <div id="trackingLoader" class="tracking-loader" style="display: none;">
                    <div class="spinner"></div>
                    <p>Cargando información de la PO...</p>
                </div>
                
                <div id="trackingResultados" style="display: none;"></div>
            </div>
        `;
        
        const filtersSection = document.querySelector('.filters-section');
        if (filtersSection) {
            filtersSection.insertAdjacentHTML('beforebegin', panelHTML);
        } else {
            container.insertAdjacentHTML('afterbegin', panelHTML);
        }
        
        this.agregarEstilos();
    },
    
    agregarEstilos: function() {
        if (document.getElementById('trackingStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'trackingStyles';
        styles.textContent = `
            .tracking-panel {
                background: linear-gradient(160deg, rgba(45,35,85,0.85) 0%, rgba(90,40,80,0.8) 30%, rgba(60,50,100,0.85) 60%, rgba(30,40,80,0.9) 100%);
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                border: 1px solid rgba(255,75,125,0.3);
                backdrop-filter: blur(10px);
            }
            .tracking-header h2 { font-size: 1.1rem; color: #ff4b7d; margin-bottom: 0.3rem; }
            .tracking-header p { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 1.5rem; }
            .tracking-buscador { margin-bottom: 1.5rem; }
            .buscador-input-group { display: flex; gap: 0.8rem; flex-wrap: wrap; }
            .buscador-input-group input { flex: 1; min-width: 250px; background: rgba(26,26,26,0.8); border: 1px solid #ff4b7d; border-radius: 6px; padding: 0.7rem 1rem; color: white; }
            .btn-primary { background: linear-gradient(90deg, #ff4b7d, #ff6b8a); border: none; padding: 0.7rem 1.5rem; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255,75,125,0.3); }
            .scanner-container { margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.5); border-radius: 8px; text-align: center; }
            .scanner-container video { width: 100%; max-width: 400px; border-radius: 8px; border: 2px solid #ff4b7d; }
            .tracking-loader { text-align: center; padding: 2rem; }
            .tracking-loader .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,75,125,0.3); border-top-color: #ff4b7d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
            
            .dashboard-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .dashboard-card { background: rgba(42,42,42,0.6); border-radius: 8px; padding: 1rem; text-align: center; border-left: 3px solid #ff4b7d; }
            .dashboard-card h4 { font-size: 0.7rem; color: #ff6b8a; margin-bottom: 0.5rem; text-transform: uppercase; }
            .dashboard-card .valor { font-size: 1.4rem; font-weight: 700; color: white; }
            .dashboard-card .unidad { font-size: 0.7rem; color: rgba(255,255,255,0.5); }
            
            .procesos-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .proceso-card { background: rgba(42,42,42,0.6); border-radius: 8px; padding: 1rem; transition: all 0.3s; }
            .proceso-card.completado { border-left: 3px solid #10b981; }
            .proceso-card.actual { border-left: 3px solid #ff4b7d; background: rgba(255,75,125,0.15); }
            .proceso-card.pendiente { border-left: 3px solid #f59e0b; }
            .proceso-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
            .proceso-nombre { font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
            .proceso-estado { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 20px; }
            .proceso-estado.completado { background: rgba(16,185,129,0.2); color: #10b981; }
            .proceso-estado.actual { background: rgba(255,75,125,0.2); color: #ff4b7d; }
            .proceso-estado.pendiente { background: rgba(245,158,11,0.2); color: #f59e0b; }
            .proceso-stats { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.75rem; }
            .progreso-barra { background: rgba(0,0,0,0.5); border-radius: 10px; height: 8px; overflow: hidden; margin: 0.5rem 0; }
            .progreso-fill { height: 100%; width: 0%; border-radius: 10px; transition: width 0.5s ease; }
            .progreso-fill.verde { background: linear-gradient(90deg, #10b981, #34d399); }
            .progreso-fill.amarillo { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
            .progreso-fill.rojo { background: linear-gradient(90deg, #ef4444, #f87171); }
            
            .progresso-total { background: rgba(42,42,42,0.6); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
            .progresso-total h4 { font-size: 0.8rem; color: #ff6b8a; margin-bottom: 0.5rem; }
            .progress-bar-container { background: rgba(0,0,0,0.5); border-radius: 10px; height: 12px; overflow: hidden; margin: 0.5rem 0; }
            .progress-bar-fill { height: 100%; width: 0%; border-radius: 10px; transition: width 0.5s ease; }
            .progress-bar-fill.verde { background: linear-gradient(90deg, #10b981, #34d399); }
            .progress-bar-fill.amarillo { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
            .progress-bar-fill.rojo { background: linear-gradient(90deg, #ef4444, #f87171); }
            
            .produccion-semanal { background: rgba(42,42,42,0.6); border-radius: 8px; padding: 1rem; margin-top: 1rem; }
            .produccion-semanal h4 { font-size: 0.8rem; color: #ff6b8a; margin-bottom: 0.8rem; }
            .produccion-stats { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem; flex-wrap: wrap; gap: 0.5rem; }
            
            .tracking-error { background: rgba(239,68,68,0.2); border-left: 3px solid #ef4444; padding: 1rem; border-radius: 6px; margin-top: 1rem; text-align: center; color: #f87171; }
            @keyframes spin { to { transform: rotate(360deg); } }
            @media (max-width: 768px) { .procesos-cards { grid-template-columns: 1fr; } }
        `;
        document.head.appendChild(styles);
    },
    
    configurarEventos: function() {
        document.getElementById('trackingBuscarBtn')?.addEventListener('click', () => this.buscarPO());
        document.getElementById('trackingEscanearBtn')?.addEventListener('click', () => this.iniciarScanner());
        document.getElementById('trackingCerrarScanner')?.addEventListener('click', () => this.cerrarScanner());
        document.getElementById('trackingPoInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscarPO();
        });
    },
    
    buscarPO: function() {
        const poInput = document.getElementById('trackingPoInput');
        const po = poInput ? poInput.value.trim().toUpperCase() : '';
        
        if (!po) {
            this.mostrarError('Por favor ingrese un número de PO');
            return;
        }
        
        this.mostrarLoader(true);
        
        setTimeout(() => {
            const registroEncontrado = AppState.registros.find(r => r.po === po);
            
            if (registroEncontrado) {
                this.datosPO = registroEncontrado;
                this.poActual = po;
                this.mostrarResultados();
            } else {
                this.mostrarError('No se encontró la PO: ' + po);
                document.getElementById('trackingResultados').style.display = 'none';
            }
            this.mostrarLoader(false);
        }, 500);
    },
    
    iniciarScanner: function() {
        const scannerContainer = document.getElementById('trackingScannerContainer');
        const video = document.getElementById('trackingVideo');
        
        if (!scannerContainer || !video) return;
        
        scannerContainer.style.display = 'block';
        
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                video.setAttribute('playsinline', true);
                video.play();
                setTimeout(() => {
                    this.cerrarScanner();
                    const poInput = document.getElementById('trackingPoInput');
                    if (poInput) poInput.value = this.datosPO ? this.datosPO.po : 'PO-2401-001';
                    this.buscarPO();
                }, 2000);
            })
            .catch(err => {
                this.mostrarError('No se pudo acceder a la cámara');
                this.cerrarScanner();
            });
    },
    
    cerrarScanner: function() {
        const scannerContainer = document.getElementById('trackingScannerContainer');
        const video = document.getElementById('trackingVideo');
        
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        
        if (scannerContainer) {
            scannerContainer.style.display = 'none';
        }
    },
    
    mostrarResultados: function() {
        if (!this.datosPO) return;
        
        const resultadosDiv = document.getElementById('trackingResultados');
        if (!resultadosDiv) return;
        
        const procesoActual = this.datosPO.proceso;
        const procesosCompletados = this.obtenerProcesosCompletados(procesoActual);
        const porcentajeTotal = this.calcularPorcentajeAvance(procesoActual);
        
        let colorBarra = 'rojo';
        if (porcentajeTotal >= 80) colorBarra = 'verde';
        else if (porcentajeTotal >= 40) colorBarra = 'amarillo';
        
        const piezasCompletadas = this.calcularPiezasCompletadas(procesoActual);
        const porcentajeCumplimiento = Math.min(100, Math.round((piezasCompletadas / this.metaPiezas) * 100));
        
        // Generar cards de procesos con porcentajes
        let procesosCardsHtml = '';
        for (let i = 0; i < this.procesos.length; i++) {
            const proceso = this.procesos[i];
            const estado = this.getEstadoProceso(proceso, procesoActual, procesosCompletados);
            const piezasProceso = this.piezasPorProceso[proceso];
            const piezasRealizadas = this.getPiezasRealizadasProceso(proceso, procesoActual);
            const porcentajeProceso = Math.min(100, Math.round((piezasRealizadas / piezasProceso) * 100));
            
            let colorProgreso = 'rojo';
            if (porcentajeProceso >= 80) colorProgreso = 'verde';
            else if (porcentajeProceso >= 40) colorProgreso = 'amarillo';
            
            procesosCardsHtml += `
                <div class="proceso-card ${estado}">
                    <div class="proceso-header">
                        <div class="proceso-nombre">${this.getIconoProceso(proceso)} ${proceso}</div>
                        <div class="proceso-estado ${estado}">${this.getTextoEstado(estado)}</div>
                    </div>
                    <div class="proceso-stats">
                        <span>📦 Piezas: ${piezasRealizadas} / ${piezasProceso}</span>
                        <span>📊 ${porcentajeProceso}%</span>
                    </div>
                    <div class="progreso-barra">
                        <div class="progreso-fill ${colorProgreso}" style="width: ${porcentajeProceso}%"></div>
                    </div>
                    <div class="proceso-stats" style="margin-top: 0.5rem;">
                        <span>👤 ${this.getResponsableProceso(proceso)}</span>
                        <span>📅 ${this.getFechaProceso(proceso)}</span>
                    </div>
                </div>
            `;
        }
        
        const html = `
            <div class="tracking-dashboard">
                <div class="dashboard-cards">
                    <div class="dashboard-card"><h4>PO</h4><div class="valor">${this.datosPO.po}</div></div>
                    <div class="dashboard-card"><h4>ESTILO</h4><div class="valor">${this.datosPO.estilo || '-'}</div></div>
                    <div class="dashboard-card"><h4>TELA</h4><div class="valor">${this.datosPO.tela || '-'}</div></div>
                    <div class="dashboard-card"><h4>VERSIÓN</h4><div class="valor">v${this.datosPO.version || 1}</div></div>
                    <div class="dashboard-card"><h4>META</h4><div class="valor">${this.metaPiezas}</div><div class="unidad">piezas</div></div>
                    <div class="dashboard-card"><h4>COMPLETADAS</h4><div class="valor">${piezasCompletadas}</div><div class="unidad">piezas (${porcentajeCumplimiento}%)</div></div>
                </div>
                
                <div class="progresso-total">
                    <h4>📊 AVANCE TOTAL DE PRODUCCIÓN</h4>
                    <div class="progress-bar-container"><div class="progress-bar-fill ${colorBarra}" style="width: ${porcentajeTotal}%"></div></div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span>${porcentajeTotal}% completado</span>
                        <span>Proceso actual: ${procesoActual}</span>
                        <span>Cumplimiento: ${porcentajeCumplimiento}%</span>
                    </div>
                </div>
                
                <h3 style="margin: 1rem 0 0.8rem; color: #ff6b8a;">📋 PROGRESO POR PROCESO</h3>
                <div class="procesos-cards">${procesosCardsHtml}</div>
                
                <div class="produccion-semanal">
                    <h4>📈 PRODUCCIÓN SEMANAL</h4>
                    <div class="produccion-stats">
                        <span>Meta: <strong>${this.metaPiezas}</strong> piezas</span>
                        <span>Completadas: <strong>${piezasCompletadas}</strong> piezas</span>
                        <span>Cumplimiento: <strong>${porcentajeCumplimiento}%</strong></span>
                    </div>
                    <div class="progress-bar-container"><div class="progress-bar-fill verde" style="width: ${porcentajeCumplimiento}%"></div></div>
                </div>
            </div>
        `;
        
        resultadosDiv.innerHTML = html;
        resultadosDiv.style.display = 'block';
    },
    
    obtenerProcesosCompletados: function(procesoActual) {
        const indexActual = this.procesos.indexOf(procesoActual);
        return this.procesos.slice(0, indexActual);
    },
    
    calcularPorcentajeAvance: function(procesoActual) {
        const indexActual = this.procesos.indexOf(procesoActual);
        return Math.round(((indexActual + 1) / this.procesos.length) * 100);
    },
    
    calcularPiezasCompletadas: function(procesoActual) {
        const indexActual = this.procesos.indexOf(procesoActual);
        let total = 0;
        for (let i = 0; i <= indexActual; i++) {
            total += this.piezasPorProceso[this.procesos[i]];
        }
        return total;
    },
    
    getPiezasRealizadasProceso: function(proceso, procesoActual) {
        const completados = this.obtenerProcesosCompletados(procesoActual);
        if (completados.includes(proceso)) {
            return this.piezasPorProceso[proceso];
        } else if (proceso === procesoActual) {
            return Math.round(this.piezasPorProceso[proceso] * 0.6);
        }
        return 0;
    },
    
    getIconoProceso: function(proceso) {
        const iconos = { 'DISEÑO': '🎨', 'PLOTTER': '🖨️', 'SUBLIMADO': '🔥', 'FLAT': '📏', 'LASER': '⚡', 'BORDADO': '🧵' };
        return iconos[proceso] || '⚙️';
    },
    
    getEstadoProceso: function(proceso, procesoActual, completados) {
        if (completados.includes(proceso)) return 'completado';
        if (proceso === procesoActual) return 'actual';
        return 'pendiente';
    },
    
    getTextoEstado: function(estado) {
        if (estado === 'completado') return '✅ Terminado';
        if (estado === 'actual') return '🔄 En proceso';
        return '⏳ Pendiente';
    },
    
    getResponsableProceso: function(proceso) {
        const responsables = { 'DISEÑO': 'Carlos M.', 'PLOTTER': 'Ana G.', 'SUBLIMADO': 'Luis R.', 'FLAT': 'Marta S.', 'LASER': 'Jorge P.', 'BORDADO': 'Elena T.' };
        return responsables[proceso] || 'Por asignar';
    },
    
    getFechaProceso: function(proceso) {
        const fechaBase = new Date(this.datosPO.fecha);
        const dias = { 'DISEÑO': 0, 'PLOTTER': 1, 'SUBLIMADO': 2, 'FLAT': 3, 'LASER': 4, 'BORDADO': 5 };
        const fecha = new Date(fechaBase);
        fecha.setDate(fecha.getDate() + (dias[proceso] || 0));
        return Utils.formatearFecha(fecha.toISOString().split('T')[0]);
    },
    
    mostrarLoader: function(mostrar) {
        const loader = document.getElementById('trackingLoader');
        if (loader) loader.style.display = mostrar ? 'block' : 'none';
    },
    
    mostrarError: function(mensaje) {
        const resultadosDiv = document.getElementById('trackingResultados');
        if (resultadosDiv) {
            resultadosDiv.innerHTML = '<div class="tracking-error">⚠️ ' + mensaje + '</div>';
            resultadosDiv.style.display = 'block';
        }
        setTimeout(() => {
            if (resultadosDiv && resultadosDiv.innerHTML.includes('tracking-error')) {
                resultadosDiv.style.display = 'none';
            }
        }, 3000);
    }
};

window.TrackingModule = TrackingModule;
