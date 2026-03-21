// js/modules/registros.js
const RegistrosModule = {
    getById: function(id) {
        return AppState.registros.find(r => r.id === id);
    },
    
    filtrar: function() {
        const search = AppState.currentSearch;
        const semana = AppState.currentSemana;
        if (!search && !semana) return AppState.registros;
        const termino = search ? search.toLowerCase().trim() : '';
        return AppState.registros.filter(reg => {
            if (semana && parseInt(reg.semana) !== parseInt(semana)) return false;
            if (!termino) return true;
            let texto = `${reg.po} ${reg.proceso} ${reg.estilo} ${reg.tela} ${reg.adhesivo}`;
            if (reg.colores) reg.colores.forEach(c => texto += ' ' + c.nombre);
            return texto.toLowerCase().includes(termino);
        });
    },
    
    guardar: async function(datos) {
        const editId = document.getElementById('editId').value;
        const ahora = new Date().toISOString();
        const registroData = { ...datos, actualizado: ahora, version: 1 };
        
        if (editId) {
            const index = AppState.registros.findIndex(r => r.id === editId);
            if (index !== -1) {
                const original = AppState.registros[index];
                if (!AppState.historialEdiciones[editId]) AppState.historialEdiciones[editId] = [];
                AppState.historialEdiciones[editId].push({
                    fecha: ahora, descripcion: datos.descripcionEdicion || 'Edición',
                    anterior: { po: original.po, proceso: original.proceso, version: original.version },
                    nuevo: { po: registroData.po, proceso: registroData.proceso, version: registroData.version }
                });
                registroData.creado = original.creado;
                registroData.version = (original.version || 1) + 1;
                AppState.updateRegistro(editId, registroData);
                
                if(window.SupabaseClient && window.SupabaseClient.client) {
                    await window.SupabaseClient.guardarRegistro(registroData);
                    await window.SupabaseClient.guardarHistorial({
                        registro_id: editId,
                        descripcion: datos.descripcionEdicion || 'Edición',
                        anterior_po: original.po,
                        anterior_proceso: original.proceso,
                        anterior_version: original.version,
                        nuevo_po: registroData.po,
                        nuevo_proceso: registroData.proceso,
                        nuevo_version: registroData.version
                    });
                }
                Notifications.success(`✅ Editado v${registroData.version}`);
                return true;
            }
        } else {
            registroData.id = Utils.generarIdUnico();
            registroData.creado = ahora;
            AppState.addRegistro(registroData);
            if(window.SupabaseClient && window.SupabaseClient.client) {
                await window.SupabaseClient.guardarRegistro(registroData);
            }
            Notifications.success('✅ Registro guardado');
            return true;
        }
        return false;
    },
    
    eliminar: async function(id) {
        if (confirm('¿Eliminar este registro?')) {
            AppState.registros = AppState.registros.filter(r => r.id !== id);
            delete AppState.historialEdiciones[id];
            if(window.SupabaseClient && window.SupabaseClient.client) {
                await window.SupabaseClient.eliminarRegistro(id);
            }
            Notifications.success('🗑️ Eliminado');
            return true;
        }
        return false;
    },
    
    obtenerFormulario: function() {
        // Función auxiliar para obtener valor de un elemento de forma segura
        const getValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ Elemento no encontrado: ${id}`);
                return defaultValue;
            }
            return element.value;
        };
        
        // Función auxiliar para obtener valor numérico de forma segura
        const getNumber = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ Elemento no encontrado: ${id}`);
                return defaultValue;
            }
            const value = parseFloat(element.value);
            return isNaN(value) ? defaultValue : value;
        };
        
        // Función auxiliar para obtener checkbox de forma segura
        const getCheckbox = (id, defaultValue = false) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ Elemento no encontrado: ${id}`);
                return defaultValue;
            }
            return element.checked;
        };
        
        const fechaStr = getValue('fecha', new Date().toISOString().split('T')[0]);
        const fecha = new Date(fechaStr);
        
        return {
            po: getValue('po', '').toUpperCase(),
            proceso: getValue('proceso', ''),
            esReemplazo: getCheckbox('esReemplazo', false),
            fecha: fechaStr,
            estilo: getValue('estilo', '').toUpperCase(),
            tela: getValue('tela', '').toUpperCase(),
            colores: ColoresModule.obtenerDelFormulario(),
            numero_plotter: getNumber('numero_plotter', 0),
            plotter_temp: getNumber('plotter_temp', 0),
            plotter_humedad: getNumber('plotter_humedad', 0),
            plotter_perfil: getValue('plotter_perfil', '').toUpperCase(),
            monti_numero: getNumber('monti_numero', 0),
            temperatura_monti: getNumber('temp_monti', 0),
            velocidad_monti: getNumber('vel_monti', 0),
            monti_presion: getNumber('monti_presion', 0),
            temperatura_flat: getNumber('temp_flat', 0),
            tiempo_flat: getNumber('tiempo_flat', 0),
            adhesivo: getValue('adhesivo', '').toUpperCase(),
            observacion: getValue('observacion', null),
            semana: Utils.obtenerSemana(fecha)
        };
    },
    
    cargarFormulario: function(reg) {
        const set = (id, v) => { 
            const el = document.getElementById(id); 
            if(el) el.value = v !== undefined && v !== null ? v : ''; 
            else console.warn(`⚠️ Elemento no encontrado: ${id}`);
        };
        
        set('po', reg.po);
        set('proceso', reg.proceso);
        const esReemplazo = document.getElementById('esReemplazo');
        if(esReemplazo) esReemplazo.checked = reg.esReemplazo;
        set('fecha', reg.fecha);
        set('estilo', reg.estilo);
        set('tela', reg.tela);
        set('numero_plotter', reg.numero_plotter);
        set('plotter_temp', reg.plotter_temp);
        set('plotter_humedad', reg.plotter_humedad);
        set('plotter_perfil', reg.plotter_perfil);
        set('monti_numero', reg.monti_numero);
        set('temp_monti', reg.temperatura_monti);
        set('vel_monti', reg.velocidad_monti);
        set('monti_presion', reg.monti_presion);
        set('temp_flat', reg.temperatura_flat);
        set('tiempo_flat', reg.tiempo_flat);
        set('adhesivo', reg.adhesivo);
        if(reg.observacion) set('observacion', reg.observacion);
        ColoresModule.cargarEnFormulario(reg.colores);
    }
};

window.RegistrosModule = RegistrosModule;
console.log('✅ RegistrosModule cargado');
