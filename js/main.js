// ==================== PUNTO DE ENTRADA PRINCIPAL ====================

// Variable para controlar si los datos ya se cargaron
let datosCargados = false;

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Alpha DB v9.0...');
    
    // Verificar que la configuración existe
    if (typeof APP_CONFIG === 'undefined') {
        console.error('❌ ERROR: APP_CONFIG no está definido. Verifica que onedrive-config.js se cargó correctamente.');
        Notifications.error('Error de configuración. Revisa la consola.');
        return;
    }
    
    // Configurar callback para cambios de estado
    window.onStateChange = function() {
        if (TablaUI && TablaUI.actualizar) {
            TablaUI.actualizar();
        }
    };
    
    // Inicializar UI
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.value = hoy;
        fechaInput.setAttribute('max', hoy);
        fechaInput.addEventListener('change', function() {
            if (FormularioUI && FormularioUI.verificarFecha) {
                FormularioUI.verificarFecha();
            }
        });
    }
    
    // Botón agregar color
    const agregarColorBtn = document.getElementById('agregarColorBtn');
    if (agregarColorBtn && ColoresModule) {
        agregarColorBtn.addEventListener('click', () => ColoresModule.agregarGrupo());
    }
    
    // Buscador
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (AppState) {
                AppState.setFiltros(e.target.value, AppState.currentSemana);
            }
            if (TablaUI && TablaUI.actualizar) {
                TablaUI.actualizar();
            }
        });
    }
    
    // Botón limpiar búsqueda
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            if (AppState) {
                AppState.setFiltros('', AppState.currentSemana);
            }
            if (TablaUI && TablaUI.actualizar) {
                TablaUI.actualizar();
            }
        });
    }
    
    // Botón limpiar filtros
    const limpiarFiltro = document.getElementById('limpiarFiltroBtn');
    if (limpiarFiltro) {
        limpiarFiltro.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            if (AppState) {
                AppState.setFiltros('', '');
            }
            if (TablaUI && TablaUI.actualizar) {
                TablaUI.actualizar();
            }
            if (Notifications) {
                Notifications.info('🧹 Filtros eliminados');
            }
        });
    }
    
    // Cargar datos
    cargarDatosIniciales();
    
    // Configurar eventos de botones
    configurarEventos();
    
    // Inicializar autenticación SharePoint
    if (SharePointAuth && SharePointAuth.init) {
        SharePointAuth.init();
    }
    
    // Agregar un grupo de color inicial si no hay ninguno
    setTimeout(() => {
        const container = document.getElementById('coloresContainer');
        if (container && ColoresModule && container.children.length === 0) {
            ColoresModule.agregarGrupo();
        }
    }, 100);
});

function cargarDatosIniciales() {
    if (!APP_CONFIG) {
        console.error('APP_CONFIG no disponible');
        return;
    }
    
    const datosGuardados = localStorage.getItem(APP_CONFIG.sistema.localStorageKey);
    
    if (datosGuardados) {
        try {
            const data = JSON.parse(datosGuardados);
            if (AppState) {
                AppState.setRegistros(data.registros || []);
                AppState.historialEdiciones = data.historial || {};
            }
            console.log(`📦 Cargados ${data.registros ? data.registros.length : 0} registros de localStorage`);
        } catch (e) {
            console.error('Error al cargar:', e);
            generarDatosEjemplo();
        }
    } else {
        generarDatosEjemplo();
    }
    
    if (TablaUI && TablaUI.actualizar) {
        TablaUI.actualizar();
    }
    if (CalendarioUI && CalendarioUI.actualizar) {
        CalendarioUI.actualizar();
    }
    
    datosCargados = true;
}

function generarDatosEjemplo() {
    if (!AppState || !Utils) {
        console.error('AppState o Utils no disponibles');
        return;
    }
    
    const ejemplos = [];
    const pos = ['PO-2401-001', 'PO-2401-002', 'PO-2402-015', 'PO-2402-023'];
    const procesos = ['DISEÑO', 'PLOTTER', 'SUBLIMADO', 'FLAT', 'LASER', 'BORDADO'];
    const estilos = ['LIBRE', 'MARIPOSA', 'PECHO', 'ESPALDA'];
    const telas = ['ALGODÓN', 'POLIÉSTER', 'NYLON'];
    const nombresColores = ['ROJO INTENSO', 'AZUL MARINO', 'VERDE BANDEIRA'];
    const ahora = new Date().toISOString();
    const hoy = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 5; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i * 2);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        const colores = [{
            id: 1,
            nombre: nombresColores[Math.floor(Math.random() * nombresColores.length)],
            cyan: parseFloat((Math.random() * 100).toFixed(1)),
            magenta: parseFloat((Math.random() * 100).toFixed(1)),
            yellow: parseFloat((Math.random() * 100).toFixed(1)),
            black: parseFloat((Math.random() * 100).toFixed(1)),
            turquesa: 0, naranja: 0, fluorYellow: 0, fluorPink: 0
        }];
        
        ejemplos.push({
            id: Utils.generarIdUnico(),
            po: pos[Math.floor(Math.random() * pos.length)],
            proceso: procesos[Math.floor(Math.random() * procesos.length)],
            esReemplazo: Math.random() > 0.7,
            semana: Utils.obtenerSemana(fecha),
            fecha: fechaStr,
            estilo: estilos[Math.floor(Math.random() * estilos.length)],
            tela: telas[Math.floor(Math.random() * telas.length)],
            colores: colores,
            numero_plotter: Math.floor(Math.random() * 5),
            plotter_temp: parseFloat((20 + Math.random() * 10).toFixed(1)),
            plotter_humedad: parseFloat((40 + Math.random() * 20).toFixed(0)),
            plotter_perfil: ['BAJO', 'MEDIO', 'ALTO'][Math.floor(Math.random() * 3)],
            monti_numero: Math.floor(Math.random() * 10) + 1,
            temperatura_monti: parseFloat((170 + Math.random() * 20).toFixed(1)),
            velocidad_monti: parseFloat((2 + Math.random() * 2).toFixed(1)),
            monti_presion: parseFloat((3 + Math.random() * 2).toFixed(1)),
            temperatura_flat: parseFloat((150 + Math.random() * 20).toFixed(1)),
            tiempo_flat: parseFloat((10 + Math.random() * 10).toFixed(1)),
            adhesivo: 'TIPO A',
            creado: ahora,
            actualizado: ahora,
            version: 1,
            observacion: fechaStr < hoy ? 'Registro retroactivo' : null
        });
    }
    
    AppState.setRegistros(ejemplos);
    guardarDatosLocal();
}

function guardarDatosLocal() {
    if (!AppState || !APP_CONFIG) return;
    
    try {
        const registrosParaGuardar = AppState.registros.map(reg => {
            const { historial, ...regSinHistorial } = reg;
            return regSinHistorial;
        });
        
        const dataToSave = {
            registros: registrosParaGuardar,
            historial: AppState.historialEdiciones
        };
        localStorage.setItem(APP_CONFIG.sistema.localStorageKey, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function configurarEventos() {
    // Formulario
    const registroForm = document.getElementById('registroForm');
    if (registroForm && RegistrosModule) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const datos = RegistrosModule.obtenerDelFormulario();
            const editId = document.getElementById('editId').value;
            
            if (editId) {
                datos.descripcionEdicion = prompt('📝 Describe brevemente qué cambios realizaste:', '');
            }
            
            const exito = RegistrosModule.guardar(datos);
            
            if (exito) {
                guardarDatosLocal();
                if (FormularioUI) FormularioUI.reset();
                if (TablaUI) TablaUI.actualizar();
            }
        });
    }
    
    // Cancelar edición
    const cancelEdit = document.getElementById('cancelEditBtn');
    if (cancelEdit && FormularioUI) {
        cancelEdit.addEventListener('click', () => FormularioUI.reset());
    }
    
    // Exportar base de datos
    const exportarDB = document.getElementById('exportarDBBtn');
    if (exportarDB) {
        exportarDB.addEventListener('click', () => {
            if (!AppState || !APP_CONFIG) return;
            
            const dataToExport = {
                sistema: APP_CONFIG.sistema.nombre,
                version: APP_CONFIG.sistema.version,
                fecha_exportacion: new Date().toISOString(),
                registros: AppState.registros,
                historial: AppState.historialEdiciones,
                total_registros: AppState.registros.length
            };
            
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ALPHA_DB_${new Date().toISOString().split('T')[0]}${APP_CONFIG.backup.extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (Notifications) Notifications.success('💾 Base de datos guardada');
        });
    }
    
    // Importar base de datos
    const importarDB = document.getElementById('importarDB');
    if (importarDB) {
        importarDB.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.name.endsWith('.adb')) {
                if (Notifications) Notifications.error('❌ Debe ser archivo .adb');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!importedData.registros || !Array.isArray(importedData.registros)) {
                        throw new Error('Estructura inválida');
                    }
                    
                    if (confirm(`¿Cargar ${importedData.registros.length} registros?`)) {
                        if (AppState) {
                            AppState.setRegistros(importedData.registros);
                            AppState.historialEdiciones = importedData.historial || {};
                        }
                        guardarDatosLocal();
                        if (FormularioUI) FormularioUI.reset();
                        if (TablaUI) TablaUI.actualizar();
                        if (Notifications) Notifications.success(`📂 Cargados ${AppState.registros.length} registros`);
                    }
                } catch (error) {
                    if (Notifications) Notifications.error('❌ Archivo inválido');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        });
    }
    
    // Exportar Excel
    const exportarExcel = document.getElementById('exportarExcelBtn');
    if (exportarExcel && typeof XLSX !== 'undefined') {
        exportarExcel.addEventListener('click', () => {
            if (!AppState) return;
            
            const registrosFiltrados = RegistrosModule ? RegistrosModule.filtrar() : AppState.registros;
            if (registrosFiltrados.length === 0) {
                if (Notifications) Notifications.error('❌ No hay registros');
                return;
            }
            
            const datosExcel = registrosFiltrados.map(reg => {
                const fila = {
                    'PO': reg.po || '',
                    'Versión': reg.version || 1,
                    'Proceso': reg.proceso || '',
                    'Reemplazo': reg.esReemplazo ? 'Sí' : 'No',
                    'Semana': reg.semana,
                    'Fecha': reg.fecha,
                    'Estilo/Deporte': reg.estilo,
                    'Tela': reg.tela,
                    'N° Plotter': reg.numero_plotter || 0,
                    'Plotter Temp': reg.plotter_temp || 0,
                    'Plotter Humedad': reg.plotter_humedad || 0,
                    'Plotter Perfil': reg.plotter_perfil || '',
                    'N° Monti': reg.monti_numero || 0,
                    'Temp Monti °C': reg.temperatura_monti,
                    'Vel Monti m/min': reg.velocidad_monti,
                    'Temp Flat °C': reg.temperatura_flat,
                    'Tiempo Flat s': reg.tiempo_flat,
                    'Adhesivo': reg.adhesivo,
                    'Observación': reg.observacion || ''
                };
                return fila;
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datosExcel);
            XLSX.utils.book_append_sheet(wb, ws, 'Registros ALPHA DB');
            XLSX.writeFile(wb, `ALPHA_DB_${new Date().toISOString().split('T')[0]}.xlsx`);
            if (Notifications) Notifications.success('📊 Archivo Excel generado');
        });
    }
    
    // Imprimir reportes
    const imprimirReportes = document.getElementById('imprimirReportesBtn');
    if (imprimirReportes) {
        imprimirReportes.addEventListener('click', () => {
            if (!AppState) return;
            
            const registrosFiltrados = RegistrosModule ? RegistrosModule.filtrar() : AppState.registros;
            if (registrosFiltrados.length === 0) {
                if (Notifications) Notifications.error('❌ No hay registros');
                return;
            }
            
            const ventana = window.open('', '_blank');
            let html = `<!DOCTYPE html><html><head><title>Reporte ALPHA DB</title><style>
                body{font-family:Arial;margin:0.5in} h1{text-align:center}
                table{width:100%;border-collapse:collapse;margin-top:20px;font-size:9px}
                th{background:#000;color:white;padding:4px}
                td{padding:3px;border-bottom:1px solid #000}
            </style></head><body>
            <h1>⚡ ALPHA DB - REPORTE</h1>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            <p>Total: ${registrosFiltrados.length} registros</p>
            <table><thead><tr><th>PO</th><th>V</th><th>Proceso</th><th>Reemp</th><th>Sem</th><th>Fecha</th><th>Estilo</th><th>Tela</th><th>T°M</th><th>Vel</th><th>T°F</th></tr></thead><tbody>`;
            
            registrosFiltrados.forEach(reg => {
                html += `<tr><td>${reg.po}</td><td>v${reg.version}</td><td>${reg.proceso}</td>
                         <td>${reg.esReemplazo ? 'Sí' : 'No'}</td><td>${reg.semana}</td>
                         <td>${Utils ? Utils.formatearFecha(reg.fecha) : reg.fecha}</td><td>${reg.estilo}</td>
                         <td>${reg.tela}</td><td>${(reg.temperatura_monti || 0).toFixed(1)}°</td>
                         <td>${(reg.velocidad_monti || 0).toFixed(1)}</td>
                         <td>${(reg.temperatura_flat || 0).toFixed(1)}°</td></tr>`;
            });
            
            html += `</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`;
            ventana.document.write(html);
            ventana.document.close();
        });
    }
    
    // Botones SharePoint
    const syncBtn = document.getElementById('syncOnedriveBtn');
    if (syncBtn && SharePointAuth && SharePointSync) {
        syncBtn.addEventListener('click', async () => {
            if (SharePointAuth.isConnected()) {
                const data = {
                    sistema: APP_CONFIG.sistema.nombre,
                    version: APP_CONFIG.sistema.version,
                    fecha: new Date().toISOString(),
                    registros: AppState.registros,
                    historial: AppState.historialEdiciones
                };
                const filename = `ALPHA_DB_${new Date().toISOString().split('T')[0]}${APP_CONFIG.backup.extension}`;
                await SharePointSync.uploadBackup(filename, JSON.stringify(data, null, 2));
            } else {
                await SharePointAuth.login();
            }
        });
    }
}

// Funciones globales para uso en HTML
window.editarRegistro = (id) => {
    if (FormularioUI && FormularioUI.cargarParaEdicion) {
        FormularioUI.cargarParaEdicion(id);
    }
};

window.verHistorial = (id) => {
    if (!AppState) return;
    
    const registro = AppState.registros.find(r => r.id === id);
    if (!registro) return;
    
    const historial = AppState.historialEdiciones[id] || [];
    const modal = document.getElementById('modalHistorial');
    const container = document.getElementById('historialContainer');
    
    let html = '';
    if (historial.length === 0) {
        html = '<p class="no-data">No hay historial de ediciones</p>';
    } else {
        html = historial.map((entry, idx) => `
            <div class="historial-item">
                <div class="historial-fecha">📅 ${new Date(entry.fecha).toLocaleString()}</div>
                <div>📝 ${entry.descripcion || 'Sin descripción'}</div>
                <div style="margin-top: 5px;">
                    <span style="color: #ff6b6b;">⬅️ ANTERIOR:</span> PO: ${entry.anterior.po} | v${entry.anterior.version}<br>
                    <span style="color: #4caf50;">➡️ NUEVO:</span> PO: ${entry.nuevo.po} | v${entry.nuevo.version}
                </div>
            </div>
        `).join('');
    }
    
    if (container) container.innerHTML = html;
    if (modal) modal.classList.add('show');
};

window.imprimirRegistroIndividual = (id) => {
    if (!AppState || !Utils) return;
    
    const reg = AppState.registros.find(r => r.id === id);
    if (!reg) return;
    
    const ventana = window.open('', '_blank');
    const qrData = `PO:${reg.po}|V:${reg.version}|F:${reg.fecha}`;
    
    let coloresHtml = '';
    if (reg.colores && reg.colores.length > 0) {
        coloresHtml = reg.colores.map(c => `
            <div style="border-left:4px solid #ff6b6b; padding:8px; margin:8px 0; background:#f0f0f0">
                <strong>${c.nombre}</strong><br>
                C:${c.cyan}% M:${c.magenta}% Y:${c.yellow}% K:${c.black}%
            </div>
        `).join('');
    }
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Etiqueta ${reg.po}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <style>
            body{margin:0.25in;font-family:Arial}
            .etiqueta{border:2px solid #000;padding:20px}
            .header{display:flex;justify-content:space-between;border-bottom:2px solid #000}
            .po{font-size:28px;font-weight:bold}
            .version{color:red;font-size:20px}
            .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f5f5f5;padding:15px;margin:15px 0}
            .qr-container{text-align:center;margin:20px}
        </style>
        </head>
        <body>
        <div class="etiqueta">
            <div class="header">
                <h1>⚡ ALPHA DB</h1>
                <div><div class="po">${reg.po}</div><div class="version">v${reg.version}</div></div>
            </div>
            <div class="info-grid">
                <div><strong>Fecha:</strong> ${Utils.formatearFecha(reg.fecha)}</div>
                <div><strong>Semana:</strong> ${reg.semana}</div>
                <div><strong>Estilo:</strong> ${reg.estilo}</div>
                <div><strong>Tela:</strong> ${reg.tela}</div>
                <div><strong>Proceso:</strong> ${reg.proceso}</div>
                <div><strong>Reemplazo:</strong> ${reg.esReemplazo ? 'SÍ' : 'NO'}</div>
            </div>
            <h3>🎨 COLORES</h3>
            ${coloresHtml}
            <h3>⚙️ PARÁMETROS</h3>
            <div><strong>PLOTTER:</strong> N°${reg.numero_plotter} | ${reg.plotter_temp}°C | ${reg.plotter_humedad}%</div>
            <div><strong>MONTI:</strong> N°${reg.monti_numero} | ${reg.temperatura_monti}°C | ${reg.velocidad_monti} m/min</div>
            <div><strong>FLAT:</strong> ${reg.temperatura_flat}°C | ${reg.tiempo_flat}s</div>
            <div class="qr-container"><div id="qrcode"></div></div>
            <div class="footer">ID: ${reg.id} | Impreso: ${new Date().toLocaleString()}</div>
        </div>
        <script>
            new QRCode(document.getElementById("qrcode"), {text: ${JSON.stringify(qrData)}, width:150, height:150});
            setTimeout(()=>window.print(),500);
        <\/script>
        </body>
        </html>
    `);
    ventana.document.close();
};

window.eliminarRegistro = async (id) => {
    if (RegistrosModule && RegistrosModule.eliminar) {
        if (RegistrosModule.eliminar(id)) {
            guardarDatosLocal();
            if (TablaUI) TablaUI.actualizar();
        }
    }
};

window.abrirModalSeleccionRegistro = () => {
    if (!AppState) return;
    
    const select = document.getElementById('selectRegistroImprimir');
    const modal = document.getElementById('modalImpresion');
    if (!select || !modal) return;
    
    select.innerHTML = '<option value="">— Seleccionar registro —</option>' + 
        AppState.registros.map(r => `<option value="${r.id}">${r.po} v${r.version} | ${r.fecha}</option>`).join('');
    modal.classList.add('show');
};

// Cerrar modales
document.querySelectorAll('.modal-close, .close-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    });
});

window.cerrarModalOnedrive = () => {
    const modal = document.getElementById('onedriveFileModal');
    if (modal) modal.remove();
};