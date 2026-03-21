// ==================== LLAMADAS A LA API DE SHAREPOINT ====================

const SharePointAPI = {
    // Obtener todos los registros
    getRegistros: async function() {
        if (!SharePointAuth.isConnected()) {
            await SharePointAuth.login();
            if (!SharePointAuth.isConnected()) return null;
        }
        
        const tokenResponse = await SharePointAuth.getToken();
        if (!tokenResponse) return null;
        
        const token = tokenResponse.accessToken;
        
        try {
            const response = await fetch(
                `${APP_CONFIG.sharepoint.siteUrl}/_api/web/lists/getbytitle('${APP_CONFIG.sharepoint.listName}')/items?$top=5000&$orderby=Id desc`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json;odata=verbose'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Error al cargar datos');
            
            const data = await response.json();
            
            return data.d.results.map(item => {
                let colores = [];
                try { colores = JSON.parse(item.ColoresJSON || '[]'); } catch(e) {}
                
                return {
                    id: item.Id.toString(),
                    po: item.PO || '',
                    proceso: item.Proceso || '',
                    esReemplazo: item.EsReemplazo || false,
                    semana: item.Semana || 0,
                    fecha: item.Fecha ? item.Fecha.split('T')[0] : '',
                    estilo: item.Estilo || '',
                    tela: item.Tela || '',
                    colores: colores,
                    numero_plotter: item.NumeroPlotter || 0,
                    plotter_temp: item.PlotterTemp || 0,
                    plotter_humedad: item.PlotterHumedad || 0,
                    plotter_perfil: item.PlotterPerfil || '',
                    monti_numero: item.MontiNumero || 0,
                    temperatura_monti: item.TempMonti || 0,
                    velocidad_monti: item.VelMonti || 0,
                    monti_presion: item.MontiPresion || 0,
                    temperatura_flat: item.TempFlat || 0,
                    tiempo_flat: item.TiempoFlat || 0,
                    adhesivo: item.Adhesivo || '',
                    version: item.Version || 1,
                    observacion: item.Observacion || '',
                    descripcion_edicion: item.DescripcionEdicion || '',
                    creado: item.Created,
                    actualizado: item.Modified
                };
            });
            
        } catch (error) {
            console.error('Error cargando desde SharePoint:', error);
            return null;
        }
    },
    
    // Guardar registro
    guardarRegistro: async function(registroData) {
        if (!SharePointAuth.isConnected()) {
            await SharePointAuth.login();
            if (!SharePointAuth.isConnected()) return false;
        }
        
        const tokenResponse = await SharePointAuth.getToken();
        if (!tokenResponse) return false;
        
        const token = tokenResponse.accessToken;
        
        const itemData = {
            '__metadata': { 'type': `SP.Data.${APP_CONFIG.sharepoint.listName}ListItem` },
            'PO': registroData.po,
            'Proceso': registroData.proceso,
            'EsReemplazo': registroData.esReemplazo,
            'Semana': registroData.semana,
            'Fecha': registroData.fecha,
            'Estilo': registroData.estilo,
            'Tela': registroData.tela,
            'ColoresJSON': JSON.stringify(registroData.colores),
            'NumeroPlotter': registroData.numero_plotter || 0,
            'PlotterTemp': registroData.plotter_temp || 0,
            'PlotterHumedad': registroData.plotter_humedad || 0,
            'PlotterPerfil': registroData.plotter_perfil || '',
            'MontiNumero': registroData.monti_numero || 0,
            'TempMonti': registroData.temperatura_monti || 0,
            'VelMonti': registroData.velocidad_monti || 0,
            'MontiPresion': registroData.monti_presion || 0,
            'TempFlat': registroData.temperatura_flat || 0,
            'TiempoFlat': registroData.tiempo_flat || 0,
            'Adhesivo': registroData.adhesivo || '',
            'Version': registroData.version || 1,
            'Observacion': registroData.observacion || '',
            'DescripcionEdicion': registroData.descripcion_edicion || ''
        };
        
        let url, method;
        const isNew = !registroData.id || registroData.id.toString().includes('ADB-');
        
        if (!isNew && !isNaN(registroData.id)) {
            url = `${APP_CONFIG.sharepoint.siteUrl}/_api/web/lists/getbytitle('${APP_CONFIG.sharepoint.listName}')/items(${registroData.id})`;
            method = 'MERGE';
        } else {
            url = `${APP_CONFIG.sharepoint.siteUrl}/_api/web/lists/getbytitle('${APP_CONFIG.sharepoint.listName}')/items`;
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'IF-MATCH': method === 'MERGE' ? '*' : undefined,
                'X-HTTP-Method': method === 'MERGE' ? 'MERGE' : undefined
            },
            body: JSON.stringify(itemData)
        });
        
        return response.ok;
    },
    
    // Eliminar registro
    eliminarRegistro: async function(id) {
        if (!SharePointAuth.isConnected()) {
            await SharePointAuth.login();
            if (!SharePointAuth.isConnected()) return false;
        }
        
        if (isNaN(id)) return true;
        
        const tokenResponse = await SharePointAuth.getToken();
        if (!tokenResponse) return false;
        
        const token = tokenResponse.accessToken;
        
        const response = await fetch(
            `${APP_CONFIG.sharepoint.siteUrl}/_api/web/lists/getbytitle('${APP_CONFIG.sharepoint.listName}')/items(${id})`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json;odata=verbose',
                    'IF-MATCH': '*'
                }
            }
        );
        
        return response.ok;
    }
};

window.SharePointAPI = SharePointAPI;