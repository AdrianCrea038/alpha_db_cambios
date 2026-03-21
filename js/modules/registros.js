// ==================== CRUD DE REGISTROS ====================

const RegistrosModule = {
    // Obtener registro por ID
    getById: function(id) {
        return AppState.registros.find(r => r.id === id);
    },
    
    // Filtrar registros
    filtrar: function() {
        const search = AppState.currentSearch;
        const semana = AppState.currentSemana;
        
        if (!search && !semana) return AppState.registros;
        
        const termino = search ? search.toLowerCase().trim() : '';
        
        return AppState.registros.filter(reg => {
            if (semana) {
                const semanaReg = parseInt(reg.semana);
                const semanaFiltro = parseInt(semana);
                if (semanaReg !== semanaFiltro) return false;
            }
            
            if (!termino) return true;
            
            let textoBusqueda = Utils.safeToString(reg.po) + ' ' + 
                               Utils.safeToString(reg.proceso) + ' ' + 
                               Utils.safeToString(reg.estilo) + ' ' + 
                               Utils.safeToString(reg.tela) + ' ' + 
                               Utils.safeToString(reg.adhesivo);
            
            if (reg.colores && Array.isArray(reg.colores)) {
                reg.colores.forEach(color => {
                    textoBusqueda += ' ' + Utils.safeToString(color.nombre);
                });
            }
            
            return textoBusqueda.toLowerCase().includes(termino);
        });
    },
    
    // Guardar registro (nuevo o edición)
    guardar: function(datos) {
        const editId = document.getElementById('editId').value;
        const ahora = new Date().toISOString();
        
        const registroData = {
            ...datos,
            actualizado: ahora,
            version: 1
        };
        
        if (editId) {
            // Edición
            const index = AppState.registros.findIndex(r => r.id === editId);
            if (index !== -1) {
                const original = AppState.registros[index];
                
                // Guardar historial
                if (!AppState.historialEdiciones[editId]) {
                    AppState.historialEdiciones[editId] = [];
                }
                
                AppState.historialEdiciones[editId].push({
                    fecha: ahora,
                    descripcion: datos.descripcionEdicion || 'Edición sin descripción',
                    anterior: {
                        po: original.po,
                        proceso: original.proceso,
                        version: original.version
                    },
                    nuevo: {
                        po: registroData.po,
                        proceso: registroData.proceso,
                        version: registroData.version
                    }
                });
                
                registroData.creado = original.creado;
                registroData.version = (original.version || 1) + 1;
                
                AppState.updateRegistro(editId, registroData);
                Notifications.success(`✅ Registro editado (versión ${registroData.version})`);
                return true;
            }
        } else {
            // Nuevo registro
            registroData.creado = ahora;
            registroData.id = Utils.generarIdUnico();
            AppState.addRegistro(registroData);
            Notifications.success('✅ Registro guardado en ALPHA DB');
            return true;
        }
        return false;
    },
    
    // Eliminar registro
    eliminar: function(id) {
        if (confirm('¿Eliminar este registro de ALPHA DB?')) {
            AppState.deleteRegistro(id);
            Notifications.success('🗑️ Registro eliminado');
            return true;
        }
        return false;
    },
    
    // Obtener datos del formulario
    obtenerDelFormulario: function() {
        return {
            po: document.getElementById('po')?.value.toUpperCase() || '',
            proceso: document.getElementById('proceso')?.value || '',
            esReemplazo: document.getElementById('esReemplazo')?.checked || false,
            fecha: document.getElementById('fecha')?.value || '',
            estilo: document.getElementById('estilo')?.value.toUpperCase() || '',
            tela: document.getElementById('tela')?.value.toUpperCase() || '',
            colores: ColoresModule.obtenerDelFormulario(),
            numero_plotter: parseInt(document.getElementById('numero_plotter')?.value) || 0,
            plotter_temp: parseFloat(document.getElementById('plotter_temp')?.value) || 0,
            plotter_humedad: parseFloat(document.getElementById('plotter_humedad')?.value) || 0,
            plotter_perfil: document.getElementById('plotter_perfil')?.value.toUpperCase() || '',
            monti_numero: parseInt(document.getElementById('monti_numero')?.value) || 0,
            temperatura_monti: parseFloat(document.getElementById('temp_monti')?.value) || 0,
            velocidad_monti: parseFloat(document.getElementById('vel_monti')?.value) || 0,
            monti_presion: parseFloat(document.getElementById('monti_presion')?.value) || 0,
            temperatura_flat: parseFloat(document.getElementById('temp_flat')?.value) || 0,
            tiempo_flat: parseFloat(document.getElementById('tiempo_flat')?.value) || 0,
            adhesivo: document.getElementById('adhesivo')?.value.toUpperCase() || '',
            observacion: document.getElementById('observacion')?.value || null,
            semana: Utils.obtenerSemana(new Date(document.getElementById('fecha')?.value))
        };
    },
    
    // Cargar registro en formulario para edición
    cargarEnFormulario: function(registro) {
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value !== undefined && value !== null ? value : '';
        };
        
        setValue('po', registro.po);
        setValue('proceso', registro.proceso);
        document.getElementById('esReemplazo').checked = registro.esReemplazo || false;
        setValue('fecha', registro.fecha);
        setValue('estilo', registro.estilo);
        setValue('tela', registro.tela);
        setValue('numero_plotter', registro.numero_plotter);
        setValue('plotter_temp', registro.plotter_temp);
        setValue('plotter_humedad', registro.plotter_humedad);
        setValue('plotter_perfil', registro.plotter_perfil);
        setValue('monti_numero', registro.monti_numero);
        setValue('temp_monti', registro.temperatura_monti);
        setValue('vel_monti', registro.velocidad_monti);
        setValue('monti_presion', registro.monti_presion);
        setValue('temp_flat', registro.temperatura_flat);
        setValue('tiempo_flat', registro.tiempo_flat);
        setValue('adhesivo', registro.adhesivo);
        
        if (registro.observacion) setValue('observacion', registro.observacion);
        
        ColoresModule.cargarEnFormulario(registro.colores);
    }
};

window.RegistrosModule = RegistrosModule;