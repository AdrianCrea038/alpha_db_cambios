// js/modules/impresion.js
const ImpresionModule = {
    imprimirEtiqueta: function(id) {
        const registro = AppState.registros.find(r => r.id === id);
        if (!registro) {
            Notifications.error('❌ Registro no encontrado');
            return;
        }
        
        const ventana = window.open('', '_blank');
        
        let coloresHtml = '';
        if (registro.colores && registro.colores.length > 0) {
            coloresHtml = registro.colores.map(c => `
                <div style="margin-bottom: 20px; border-left: 4px solid #ff6b6b; padding-left: 12px;">
                    <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">${c.nombre}</div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px;">
                        <div>C: ${c.cyan}%</div><div>M: ${c.magenta}%</div><div>Y: ${c.yellow}%</div><div>K: ${c.black}%</div>
                        <div>T: ${c.turquesa}%</div><div>N: ${c.naranja}%</div><div>FY: ${c.fluorYellow}%</div><div>FP: ${c.fluorPink}%</div>
                    </div>
                </div>
            `).join('');
        } else {
            coloresHtml = '<div style="color: #666;">Sin colores especificados</div>';
        }
        
        const qrData = `PO:${registro.po || 'S/PO'}|V:${registro.version}|F:${registro.fecha}|ID:${registro.id}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Etiqueta ${registro.po}</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; background: white; padding: 0.25in; }
                    .etiqueta { max-width: 8.5in; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .header h1 { font-size: 24px; font-weight: 800; }
                    .po-destacado { font-size: 22px; font-weight: 900; text-align: right; }
                    .version-destacado { font-size: 18px; font-weight: 900; color: #ff0000; text-align: right; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f5f5f5; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 12px; }
                    .seccion-titulo { font-size: 14px; font-weight: 800; margin: 20px 0 10px; border-bottom: 1.5px solid #000; text-transform: uppercase; }
                    .param-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
                    .param-box { background: #f9f9f9; padding: 12px; border-left: 3px solid #000; font-size: 11px; }
                    .param-box strong { display: block; font-size: 12px; margin-bottom: 8px; }
                    .qr-container { text-align: center; margin: 20px 0; padding: 15px; background: #fafafa; border: 1px solid #ddd; }
                    #qrcode { display: inline-block; background: white; padding: 8px; border: 1px solid #ccc; }
                    .footer { text-align: center; border-top: 1px solid #ccc; padding-top: 12px; margin-top: 15px; font-size: 9px; color: #666; }
                    .observacion { margin-top: 12px; padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; font-size: 10px; }
                    @media print { body { margin: 0; padding: 0; } .etiqueta { border: 1px solid #000; } }
                </style>
            </head>
            <body>
                <div class="etiqueta">
                    <div class="header">
                        <h1>⚡ ALPHA DB</h1>
                        <div><div class="po-destacado">${registro.po || 'S/PO'}</div><div class="version-destacado">v${registro.version || 1}</div></div>
                    </div>
                    <div class="info-grid">
                        <div><strong>FECHA DE REFORMULACIÓN:</strong> ${Utils.formatearFecha(registro.fecha)}</div>
                        <div><strong>Estilo:</strong> ${registro.estilo || '-'}</div>
                        <div><strong>Semana:</strong> ${registro.semana}</div>
                        <div><strong>Tela:</strong> ${registro.tela || '-'}</div>
                        <div><strong>Proceso:</strong> ${registro.proceso || '-'}</div>
                        <div><strong>Reemplazo:</strong> ${registro.es_reemplazo ? 'SÍ' : 'NO'}</div>
                    </div>
                    <div class="seccion-titulo">🎨 ESPECIFICACIÓN DE COLORES</div>
                    <div>${coloresHtml}</div>
                    <div class="seccion-titulo">⚙️ PARÁMETROS DE PRODUCCIÓN</div>
                    <div class="param-grid">
                        <div class="param-box"><strong>🖨️ PLOTTER</strong>N° ${registro.numero_plotter || 0}<br>Temp: ${(registro.plotter_temp || 0).toFixed(1)}°C<br>Hum: ${(registro.plotter_humedad || 0).toFixed(0)}%<br>Perfil: ${registro.plotter_perfil || '-'}</div>
                        <div class="param-box"><strong>🔥 MONTI</strong>N° ${registro.monti_numero || 0}<br>Temp: ${(registro.temperatura_monti || 0).toFixed(1)}°C<br>Vel: ${(registro.velocidad_monti || 0).toFixed(1)} m/min<br>Presión: ${(registro.monti_presion || 0).toFixed(1)} bar</div>
                        <div class="param-box"><strong>📏 FLAT</strong>Temp: ${(registro.temperatura_flat || 0).toFixed(1)}°C<br>Tiempo: ${(registro.tiempo_flat || 0).toFixed(1)} s<br>Adhesivo: ${registro.adhesivo || '-'}</div>
                    </div>
                    <div class="qr-container"><div id="qrcode"></div><div style="font-size: 9px; margin-top: 8px;">ID: ${registro.id}</div></div>
                    ${registro.observacion ? `<div class="observacion">📝 ${registro.observacion}</div>` : ''}
                    <div class="footer"><strong>ALPHA DB</strong> | Impreso: ${new Date().toLocaleString()}</div>
                </div>
                <script>
                    try {
                        new QRCode(document.getElementById("qrcode"), { text: ${JSON.stringify(qrData)}, width: 150, height: 150, colorDark: "#000000", colorLight: "#ffffff" });
                        setTimeout(() => window.print(), 500);
                    } catch(e) { document.getElementById("qrcode").innerHTML = '<div style="color:red;">Error QR</div>'; setTimeout(() => window.print(), 500); }
                <\/script>
            </body>
            </html>
        `;
        
        ventana.document.write(html);
        ventana.document.close();
    },
    
    imprimirReporte: function() {
        const registrosFiltrados = RegistrosModule.filtrar();
        if (registrosFiltrados.length === 0) {
            Notifications.error('❌ No hay registros');
            return;
        }
        
        const ventana = window.open('', '_blank');
        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ALPHA DB - Reporte</title><style>body{font-family:Arial;margin:0.5in;}h1{text-align:center;}table{width:100%;border-collapse:collapse;margin-top:20px;font-size:10px;}th{background:#000;color:white;padding:6px;text-align:left;}td{padding:4px;border-bottom:1px solid #ccc;}.total{margin-top:20px;font-weight:bold;text-align:right;}@media print{th{background:#000!important;color:white!important;}}</style></head><body><h1>⚡ ALPHA DB - REPORTE COMPLETO</h1><p>Fecha: ${new Date().toLocaleString()}</p><p>Total: ${registrosFiltrados.length} registros</p>能能<thead>碑<th>PO</th><th>V</th><th>Proceso</th><th>Reemp</th><th>Sem</th><th>Fecha</th><th>Estilo</th><th>Tela</th><th>N°Monti</th><th>T°M</th><th>Vel</th><th>T°F</th><th>T/F</th>;</thead><tbody>`;
        
        registrosFiltrados.forEach(reg => {
            html += `发展<td>${reg.po || '-'}</td><td>v${reg.version || 1}</td><td>${reg.proceso || '-'}</td><td>${reg.es_reemplazo ? 'Sí' : 'No'}</td><td>${reg.semana}</td><td>${Utils.formatearFecha(reg.fecha)}</td><td>${reg.estilo || '-'}</td><td>${reg.tela || '-'}</td><td>${reg.monti_numero || 0}</td><td>${(reg.temperatura_monti || 0).toFixed(1)}°</td><td>${(reg.velocidad_monti || 0).toFixed(1)}</td><td>${(reg.temperatura_flat || 0).toFixed(1)}°</td><td>${(reg.tiempo_flat || 0).toFixed(1)}s</td>发展`;
        });
        
        html += `</tbody>能<table><div class="total">Total: ${registrosFiltrados.length} registros</div><script>window.onload = () => window.print();<\/script></body></html>`;
        ventana.document.write(html);
        ventana.document.close();
    }
};

window.ImpresionModule = ImpresionModule;
console.log('✅ ImpresionModule cargado');