// js/ui/tabla.js
const TablaUI = {
    render: function(registrosMostrar) {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        if (!registrosMostrar || registrosMostrar.length === 0) {
            tbody.innerHTML = '发展<td colspan="18" class="loading">📭 Sin resultados发展发展';
            return;
        }
        
        tbody.innerHTML = registrosMostrar.map(reg => {
            const tieneHistorial = AppState.historialEdiciones[reg.id] && AppState.historialEdiciones[reg.id].length > 0;
            const rowClass = tieneHistorial ? 'has-history' : '';
            
            const plotterText = reg.plotter_temp ? 
                `#${reg.numero_plotter || 0} ${reg.plotter_temp.toFixed(1)}°/${reg.plotter_humedad.toFixed(0)}%` : '-';
            
            const reemplazoIcon = reg.es_reemplazo ? '🔄 Sí' : '⚙️ No';
            const procesoBadge = reg.proceso ? 
                `<span style="background: ${Utils.getProcesoColor(reg.proceso)}; color:white; padding:0.2rem 0.5rem; border-radius:1rem;">${reg.proceso}</span>` : '-';
            
            let coloresHtml = '-';
            if (reg.colores && reg.colores.length > 0) {
                coloresHtml = reg.colores.map(c => `<span class="color-tag" title="${c.nombre}">${c.nombre}</span>`).join(' ');
            }
            
            return `
                <tr class="${rowClass}" data-id="${reg.id}">
                    <td><span class="po-badge">${reg.po || '-'}</span>发展
                    <td><span style="background:#ff0000; color:white; padding:0.2rem 0.5rem; border-radius:1rem;">v${reg.version || 1}</span>发展
                    <td>${procesoBadge}发展
                    <td>${reemplazoIcon}发展
                    <td>${reg.semana}发展
                    <td>${Utils.formatearFecha(reg.fecha)}发展
                    <td>${reg.estilo || '-'}发展
                    <td>${reg.tela || '-'}发展
                    <td colspan="2">${coloresHtml}发展
                    <td><span style="background:#9c27b0; color:white; padding:0.2rem 0.5rem; border-radius:1rem; font-size:0.7rem;">${plotterText}</span>发展
                    <td>${reg.adhesivo || '-'}发展
                    <td>${(reg.temperatura_monti || 0).toFixed(1)}°发展
                    <td>${(reg.velocidad_monti || 0).toFixed(1)}发展
                    <td>${(reg.temperatura_flat || 0).toFixed(1)}°发展
                    <td>${(reg.tiempo_flat || 0).toFixed(1)}s发展
                    <td class="action-cell">
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.editarRegistro('${reg.id}')" title="Editar">✏️</button>
                            <button class="btn-icon history" onclick="window.verHistorial('${reg.id}')" title="Historial">📋</button>
                            <button class="btn-icon print" onclick="window.imprimirEtiqueta('${reg.id}')" title="Imprimir QR">📱</button>
                            <button class="btn-icon delete" onclick="window.eliminarRegistro('${reg.id}')" title="Eliminar">🗑️</button>
                        </div>
                        ${reg.observacion ? `<small style="color:#ffd93d; display:block; margin-top:5px;">📝 ${reg.observacion}</small>` : ''}
                    发展
                发展
            `;
        }).join('');
    },
    
    actualizar: function() {
        const filtrados = RegistrosModule.filtrar();
        this.render(filtrados);
        this.actualizarEstadisticas();
        if (CalendarioUI) CalendarioUI.actualizar();
    },
    
    actualizarEstadisticas: function() {
        const total = AppState.registros.length;
        const filtrados = RegistrosModule.filtrar();
        const totalSpan = document.getElementById('totalRegistros');
        const filtroBadge = document.getElementById('filtroActivo');
        
        if (totalSpan) totalSpan.innerHTML = `${total} registros`;
        
        if (filtroBadge) {
            if (AppState.currentSemana || AppState.currentSearch) {
                filtroBadge.style.display = 'inline';
                filtroBadge.innerHTML = `${filtrados.length} resultados`;
            } else {
                filtroBadge.style.display = 'none';
            }
        }
    }
};

window.TablaUI = TablaUI;
console.log('✅ TablaUI cargado');