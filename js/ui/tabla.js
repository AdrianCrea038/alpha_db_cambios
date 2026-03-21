// ==================== RENDERIZADO DE TABLA ====================

const TablaUI = {
    render: function(registrosMostrar) {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        if (registrosMostrar.length === 0) {
            tbody.innerHTML = '发展<td colspan="17" class="loading">📭 Sin resultados</td></tr>';
            return;
        }
        
        tbody.innerHTML = registrosMostrar.map(reg => {
            const tieneHistorial = AppState.historialEdiciones[reg.id] && AppState.historialEdiciones[reg.id].length > 0;
            const rowClass = tieneHistorial ? 'has-history' : '';
            
            const plotterText = reg.plotter_temp ? 
                `#${reg.numero_plotter || 0} ${reg.plotter_temp.toFixed(1)}°/${reg.plotter_humedad.toFixed(0)}%` : '-';
            
            const reemplazoIcon = reg.esReemplazo ? '🔄 Sí' : '⚙️ No';
            const procesoBadge = reg.proceso ? 
                `<span style="background: ${Utils.getProcesoColor(reg.proceso)}; color:white; padding:0.2rem 0.5rem; border-radius:1rem;">${reg.proceso}</span>` : '-';
            
            let coloresHtml = '-';
            if (reg.colores && reg.colores.length > 0) {
                coloresHtml = reg.colores.map(c => `<span class="color-tag">${c.nombre}</span>`).join(' ');
            }
            
            return `
                <tr class="${rowClass}">
                    <td><span class="po-badge">${reg.po || '-'}</span></td>
                    <td><span style="background:#ff0000; color:white; padding:0.2rem 0.5rem; border-radius:1rem;">v${reg.version || 1}</span></td>
                    <td>${procesoBadge}</td>
                    <td>${reemplazoIcon}</td>
                    <td>${reg.semana}</td>
                    <td>${Utils.formatearFecha(reg.fecha)}</td>
                    <td>${reg.estilo}</td>
                    <td>${reg.tela}</td>
                    <td colspan="2">${coloresHtml}</td>
                    <td><span style="background:#9c27b0; color:white; padding:0.2rem 0.5rem; border-radius:1rem;">${plotterText}</span></td>
                    <td>${reg.adhesivo || '-'}</td>
                    <td>${(reg.temperatura_monti || 0).toFixed(1)}°</td>
                    <td>${(reg.velocidad_monti || 0).toFixed(1)}</td>
                    <td>${(reg.temperatura_flat || 0).toFixed(1)}°</td>
                    <td>${(reg.tiempo_flat || 0).toFixed(1)}s</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.editarRegistro('${reg.id}')">✏️</button>
                            <button class="btn-icon history" onclick="window.verHistorial('${reg.id}')">📋</button>
                            <button class="btn-icon print" onclick="window.imprimirRegistroIndividual('${reg.id}')">📱</button>
                            <button class="btn-icon delete" onclick="window.eliminarRegistro('${reg.id}')">🗑️</button>
                        </div>
                        ${reg.observacion ? `<small style="color:#ffd93d; display:block;">📝 ${reg.observacion}</small>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    actualizar: function() {
        const filtrados = RegistrosModule.filtrar();
        this.render(filtrados);
        this.actualizarEstadisticas();
        CalendarioUI.actualizar();
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