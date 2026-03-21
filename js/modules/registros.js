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
        const fechaStr = document.getElementById('fecha').value;
        const fecha = new Date(fechaStr);
        return {
            po: document.getElementById('po').value.toUpperCase(),
            proceso: document.getElementById('proceso').value,
            esReemplazo: document.getElementById('esReemplazo').checked,
            fecha: fechaStr,
            estilo: document.getElementById('estilo').value.toUpperCase(),
            tela: document.getElementById('tela').value.toUpperCase(),
            colores: ColoresModule.obtenerDelFormulario(),
            numero_plotter: parseInt(document.getElementById('numero_plotter').value) || 0,
            plotter_temp: parseFloat(document.getElementById('plotter_temp').value) || 0,
            plotter_humedad: parseFloat(document.getElementById('plotter_humedad').value) || 0,
            plotter_perfil: document.getElementById('plotter_perfil').value.toUpperCase(),
            monti_numero: parseInt(document.getElementById('monti_numero').value) || 0,
            temperatura_monti: parseFloat(document.getElementById('temp_monti').value) || 0,
            velocidad_monti: parseFloat(document.getElementById('vel_monti').value) || 0,
            monti_presion: parseFloat(document.getElementById('monti_presion').value) || 0,
            temperatura_flat: parseFloat(document.getElementById('temp_flat').value) || 0,
            tiempo_flat: parseFloat(document.getElementById('tiempo_flat').value) || 0,
            adhesivo: document.getElementById('adhesivo').value.toUpperCase(),
            observacion: document.getElementById('observacion').value || null,
            semana: Utils.obtenerSemana(fecha)
        };
    },
    
    cargarFormulario: function(reg) {
        const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v !== undefined && v !== null ? v : ''; };
        set('po', reg.po);
        set('proceso', reg.proceso);
        document.getElementById('esReemplazo').checked = reg.esReemplazo;
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
