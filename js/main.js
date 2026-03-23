// js/main.js - Sin SharePoint, solo Supabase

let datosCargados = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Alpha DB v9.0...');
    
    window.onStateChange = function() {
        if (TablaUI && TablaUI.actualizar) TablaUI.actualizar();
    };
    
    // Inicializar UI
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.value = hoy;
        fechaInput.setAttribute('max', hoy);
        fechaInput.addEventListener('change', function() {
            if (FormularioUI && FormularioUI.verificarFecha) FormularioUI.verificarFecha();
        });
    }
    
    const agregarColorBtn = document.getElementById('agregarColorBtn');
    if (agregarColorBtn && ColoresModule) {
        agregarColorBtn.addEventListener('click', () => ColoresModule.agregarGrupo());
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (AppState) AppState.setFiltros(e.target.value, AppState.currentSemana);
            if (TablaUI) TablaUI.actualizar();
        });
    }
    
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            if (AppState) AppState.setFiltros('', AppState.currentSemana);
            if (TablaUI) TablaUI.actualizar();
        });
    }
    
    const limpiarFiltro = document.getElementById('limpiarFiltroBtn');
    if (limpiarFiltro) {
        limpiarFiltro.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            if (AppState) AppState.setFiltros('', '');
            if (TablaUI) TablaUI.actualizar();
            if (Notifications) Notifications.info('🧹 Filtros eliminados');
        });
    }
    
    cargarDatosIniciales();
    configurarEventos();
    
    setTimeout(() => {
        const container = document.getElementById('coloresContainer');
        if (container && ColoresModule && container.children.length === 0) {
            ColoresModule.agregarGrupo();
        }
    }, 100);
});

async function cargarDatosIniciales() {
    // Intentar cargar desde Supabase
    if(window.SupabaseClient && window.SupabaseClient.init && window.SupabaseClient.init()) {
        console.log('📡 Conectando a Supabase...');
        const data = await window.SupabaseClient.getRegistros();
        if(data && data.length > 0) {
            if(AppState) AppState.setRegistros(data);
            console.log(`📦 Cargados ${data.length} registros desde Supabase`);
            if(TablaUI) TablaUI.actualizar();
            return;
        }
    }
    
    // Fallback a localStorage
    const saved = localStorage.getItem('alpha_db_registros_v9');
    if(saved) {
        try {
            const data = JSON.parse(saved);
            if(AppState) {
                AppState.setRegistros(data.registros || []);
                AppState.historialEdiciones = data.historial || {};
            }
            console.log(`📦 Cargados ${AppState.registros.length} registros de localStorage`);
        } catch(e) { 
            console.error('Error cargando localStorage:', e);
            generarDatosEjemplo(); 
        }
    } else {
        generarDatosEjemplo();
    }
    
    if(TablaUI) TablaUI.actualizar();
}

function generarDatosEjemplo() {
    if(!AppState || !Utils) return;
    
    const ejemplos = [];
    const pos = ['PO-2401-001', 'PO-2401-002', 'PO-2402-015', 'PO-2402-023'];
    const procesos = ['DISEÑO', 'PLOTTER', 'SUBLIMADO', 'FLAT', 'LASER', 'BORDADO'];
    const estilos = ['LIBRE', 'MARIPOSA', 'PECHO', 'ESPALDA'];
    const telas = ['ALGODÓN', 'POLIÉSTER', 'NYLON'];
    const ahora = new Date().toISOString();
    const hoy = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 3; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i * 2);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        ejemplos.push({
            id: Utils.generarIdUnico(),
            po: pos[i % pos.length],
            proceso: procesos[i % procesos.length],
            esReemplazo: false,
            semana: Utils.obtenerSemana(fecha),
            fecha: fechaStr,
            estilo: estilos[i % estilos.length],
            tela: telas[i % telas.length],
            colores: [{ id:1, nombre:'ROJO', cyan:100, magenta:0, yellow:0, black:0, turquesa:0, naranja:0, fluorYellow:0, fluorPink:0 }],
            numero_plotter: 1,
            plotter_temp: 22,
            plotter_humedad: 45,
            plotter_perfil: 'MEDIO',
            monti_numero: 1,
            temperatura_monti: 180,
            velocidad_monti: 3,
            monti_presion: 2,
            temperatura_flat: 160,
            tiempo_flat: 15,
            adhesivo: 'TIPO A',
            version: 1,
            observacion: null,
            creado: ahora,
            actualizado: ahora
        });
    }
    
    AppState.setRegistros(ejemplos);
    guardarDatosLocal();
}

function guardarDatosLocal() {
    if(!AppState) return;
    try {
        const registrosParaGuardar = AppState.registros.map(reg => {
            const { historial, ...regSinHistorial } = reg;
            return regSinHistorial;
        });
        const dataToSave = {
            registros: registrosParaGuardar,
            historial: AppState.historialEdiciones
        };
        localStorage.setItem('alpha_db_registros_v9', JSON.stringify(dataToSave));
    } catch(error) {
        console.error('Error al guardar:', error);
    }
}

function configurarEventos() {
    const registroForm = document.getElementById('registroForm');
    if (registroForm && RegistrosModule) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const datos = RegistrosModule.obtenerFormulario();
            const editId = document.getElementById('editId').value;
            if (editId) {
                datos.descripcionEdicion = prompt('📝 Describe los cambios realizados:', '');
            }
            const exito = await RegistrosModule.guardar(datos);
            if (exito) {
                guardarDatosLocal();
                if (FormularioUI) FormularioUI.reset();
                if (TablaUI) TablaUI.actualizar();
            }
        });
    }
    
    const cancelEdit = document.getElementById('cancelEditBtn');
    if (cancelEdit && FormularioUI) {
        cancelEdit.addEventListener('click', () => FormularioUI.reset());
    }
    
    const exportarDB = document.getElementById('exportarDBBtn');
    if (exportarDB) {
        exportarDB.addEventListener('click', () => {
            const dataToExport = {
                sistema: "ALPHA DB",
                version: "9.0",
                registros: AppState.registros,
                historial: AppState.historialEdiciones
            };
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {type:'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `ALPHA_DB_${new Date().toISOString().split('T')[0]}.adb`;
            a.click();
            URL.revokeObjectURL(a.href);
            Notifications.success('💾 Backup guardado');
        });
    }
    
    const importarDB = document.getElementById('importarDB');
    if (importarDB) {
        importarDB.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.name.endsWith('.adb')) { Notifications.error('Debe ser archivo .adb'); return; }
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!importedData.registros) throw new Error('Estructura inválida');
                    if (confirm(`¿Cargar ${importedData.registros.length} registros?`)) {
                        AppState.setRegistros(importedData.registros);
                        AppState.historialEdiciones = importedData.historial || {};
                        guardarDatosLocal();
                        if(window.SupabaseClient && window.SupabaseClient.client) {
                            for(const reg of AppState.registros) {
                                await window.SupabaseClient.guardarRegistro(reg);
                            }
                        }
                        FormularioUI.reset();
                        TablaUI.actualizar();
                        Notifications.success(`📂 Cargados ${AppState.registros.length} registros`);
                    }
                } catch(error) { Notifications.error('Archivo inválido'); }
            };
            reader.readAsText(file);
            event.target.value = '';
        });
    }
    
    const exportarExcel = document.getElementById('exportarExcelBtn');
    if (exportarExcel && typeof XLSX !== 'undefined') {
        exportarExcel.addEventListener('click', () => {
            const data = RegistrosModule.filtrar();
            if(!data.length) { Notifications.error('No hay registros'); return; }
            const ws = XLSX.utils.json_to_sheet(data.map(r => ({ PO:r.po, Version:r.version, Proceso:r.proceso, Fecha:r.fecha, Estilo:r.estilo, Tela:r.tela })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Registros');
            XLSX.writeFile(wb, `ALPHA_DB_${new Date().toISOString().split('T')[0]}.xlsx`);
            Notifications.success('Excel generado');
        });
    }
    
    const imprimirReportes = document.getElementById('imprimirReportesBtn');
    if (imprimirReportes) {
        imprimirReportes.addEventListener('click', () => {
            const data = RegistrosModule.filtrar();
            if(!data.length) { Notifications.error('No hay registros'); return; }
            const win = window.open('', '_blank');
            let html = `<!DOCTYPE html><html><head><title>Reporte</title><style>body{margin:0.5in;font-family:Arial}table{width:100%;border-collapse:collapse}th{background:#000;color:white;padding:4px}td{padding:3px;border-bottom:1px solid #000}</style></head><body><h1>ALPHA DB - REPORTE</h1><p>Fecha: ${new Date().toLocaleString()}</p><table><thead><tr><th>PO</th><th>V</th><th>Proceso</th><th>Fecha</th><th>Estilo</th><th>Tela</th></tr></thead><tbody>`;
            data.forEach(r => { html += `<tr><td>${r.po}</td><td>v${r.version}</td><td>${r.proceso}</td><td>${Utils.formatearFecha(r.fecha)}</td><td>${r.estilo}</td><td>${r.tela}</td></tr>`; });
            html += `</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`;
            win.document.write(html);
            win.document.close();
        });
    }
    
    const imprimirIndividual = document.getElementById('imprimirIndividualBtn');
    if (imprimirIndividual) {
        imprimirIndividual.addEventListener('click', () => {
            const select = document.getElementById('selectRegistroImprimir');
            const modal = document.getElementById('modalImpresion');
            if(select) select.innerHTML = '<option value="">Seleccionar</option>' + AppState.registros.map(r => `<option value="${r.id}">${r.po} v${r.version}</option>`).join('');
            if(modal) modal.classList.add('show');
        });
    }
}

window.editarRegistro = (id) => { if(FormularioUI) FormularioUI.cargarEdicion(id); };
window.eliminarRegistro = async (id) => { if(await RegistrosModule.eliminar(id)) { guardarDatosLocal(); if(TablaUI) TablaUI.actualizar(); } };
window.filtrarSemana = (semana) => {
    if(AppState.currentSemana == semana) AppState.setFiltros(AppState.currentSearch, '');
    else AppState.setFiltros(AppState.currentSearch, semana);
    if(TablaUI) TablaUI.actualizar();
};
window.verHistorial = (id) => {
    const reg = AppState.registros.find(r => r.id === id);
    if(!reg) return;
    const hist = AppState.historialEdiciones[id] || [];
    const modal = document.getElementById('modalHistorial');
    const container = document.getElementById('historialContainer');
    let html = hist.length ? hist.map((e,i) => `<div class="historial-item"><div>📅 ${new Date(e.fecha).toLocaleString()}</div><div>📝 ${e.descripcion || 'Sin descripción'}</div><div><span style="color:#ff6b6b;">⬅️ ${e.anterior.po} v${e.anterior.version}</span> → <span style="color:#4caf50;">${e.nuevo.po} v${e.nuevo.version}</span></div></div>`).join('') : '<p>No hay historial</p>';
    html += `<div class="historial-item"><div>⚡ ACTUAL v${reg.version}</div><div>PO: ${reg.po} | Proceso: ${reg.proceso}</div></div>`;
    container.innerHTML = html;
    modal.classList.add('show');
};
window.imprimirRegistro = (id) => {
    const reg = AppState.registros.find(r => r.id === id);
    if(!reg) return;
    const win = window.open('', '_blank');
    const qr = `PO:${reg.po}|V:${reg.version}|F:${reg.fecha}`;
    win.document.write(`<!DOCTYPE html><html><head><title>Etiqueta ${reg.po}</title><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script><style>body{margin:0.25in;font-family:Arial}.etiqueta{border:2px solid #000;padding:20px}.header{display:flex;justify-content:space-between}.po{font-size:28px;font-weight:bold}.version{color:red}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f5f5f5;padding:15px;margin:15px 0}</style></head><body><div class="etiqueta"><div class="header"><h1>⚡ ALPHA DB</h1><div><div class="po">${reg.po}</div><div class="version">v${reg.version}</div></div></div><div class="info-grid"><div><strong>Fecha:</strong> ${Utils.formatearFecha(reg.fecha)}</div><div><strong>Semana:</strong> ${reg.semana}</div><div><strong>Estilo:</strong> ${reg.estilo}</div><div><strong>Tela:</strong> ${reg.tela}</div><div><strong>Proceso:</strong> ${reg.proceso}</div><div><strong>Reemplazo:</strong> ${reg.esReemplazo ? 'SÍ' : 'NO'}</div></div><div id="qrcode" style="margin:20px auto; text-align:center"></div><div class="footer">ID: ${reg.id}</div></div><script>new QRCode(document.getElementById("qrcode"),{text:${JSON.stringify(qr)},width:150,height:150});setTimeout(()=>window.print(),500);<\/script></body></html>`);
    win.document.close();
};

document.querySelectorAll('.modal-close, .close-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    });
});

// ==================== FUNCIONES GLOBALES PARA BOTONES ====================

window.editarRegistro = (id) => {
    console.log('✏️ Editando registro:', id);
    if (FormularioUI && FormularioUI.cargarEdicion) {
        FormularioUI.cargarEdicion(id);
    } else {
        Notifications.error('Error al editar');
    }
};

window.eliminarRegistro = async (id) => {
    console.log('🗑️ Eliminando registro:', id);
    if (await RegistrosModule.eliminar(id)) {
        guardarDatosLocal();
        if (TablaUI) TablaUI.actualizar();
    }
};

window.verHistorial = (id) => {
    console.log('📋 Ver historial:', id);
    const reg = AppState.registros.find(r => r.id === id);
    if (!reg) {
        Notifications.error('Registro no encontrado');
        return;
    }
    
    const hist = AppState.historialEdiciones[id] || [];
    const modal = document.getElementById('modalHistorial');
    const container = document.getElementById('historialContainer');
    
    if (!modal || !container) return;
    
    let html = '';
    if (hist.length === 0) {
        html = '<p class="no-data" style="text-align:center; padding:20px;">📭 No hay historial de ediciones</p>';
    } else {
        html = hist.map((e, i) => `
            <div class="historial-item" style="background:#2a2a2a; border-radius:12px; padding:12px; margin-bottom:12px;">
                <div style="color:#ffd93d; margin-bottom:8px;">📅 ${new Date(e.fecha).toLocaleString()}</div>
                <div style="margin-bottom:8px;">📝 ${e.descripcion || 'Sin descripción'}</div>
                <div style="display:flex; gap:16px; flex-wrap:wrap;">
                    <div style="border-left:3px solid #ff6b6b; padding-left:8px;">
                        <div style="font-size:11px; color:#ff6b6b;">ANTERIOR</div>
                        <div>PO: ${e.anterior.po}</div>
                        <div>Proceso: ${e.anterior.proceso}</div>
                        <div>v${e.anterior.version}</div>
                    </div>
                    <div style="border-left:3px solid #4caf50; padding-left:8px;">
                        <div style="font-size:11px; color:#4caf50;">NUEVO</div>
                        <div>PO: ${e.nuevo.po}</div>
                        <div>Proceso: ${e.nuevo.proceso}</div>
                        <div>v${e.nuevo.version}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    html += `
        <div class="historial-item" style="background:#2a2a2a; border-radius:12px; padding:12px; border-left:4px solid #ffd93d;">
            <div style="color:#ffd93d;">⚡ VERSIÓN ACTUAL v${reg.version}</div>
            <div>PO: ${reg.po}</div>
            <div>Proceso: ${reg.proceso}</div>
            ${reg.observacion ? `<div>📝 ${reg.observacion}</div>` : ''}
        </div>
    `;
    
    container.innerHTML = html;
    modal.classList.add('show');
};

window.imprimirEtiqueta = (id) => {
    console.log('🖨️ Imprimiendo etiqueta para ID:', id);
    if (window.ImpresionModule && window.ImpresionModule.imprimirEtiqueta) {
        window.ImpresionModule.imprimirEtiqueta(id);
    } else {
        Notifications.error('Módulo de impresión no disponible');
    }
};
// Función global para cerrar modales
window.cerrarModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
};

// Cerrar todos los modales
window.cerrarTodosModales = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
};
