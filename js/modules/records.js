// ============================================================
// js/modules/records.js - CRUD de registros
// Versión: SIN usuarioModifico (compatible con tabla actual)
// ============================================================

const RecordsModule = {
    getById: function(id) {
        return AppState.getRegistroById(id);
    },
    
    filtrar: function() {
        return AppState.getRegistrosFiltrados();
    },
    
    guardar: async function(datos) {
        const editId = document.getElementById('editId').value;
        const ahora = new Date().toISOString();
        
        // Generar ID si es nuevo
        let idGenerado = editId;
        if (!idGenerado) {
            idGenerado = Utils.generarIdUnico();
            console.log('🆕 Nuevo ID generado:', idGenerado);
        }
        
        // Construir objeto SIN usuarioModifico
        const registroData = {
            id: idGenerado,
            po: datos.po || '',
            proceso: datos.proceso || '',
            es_reemplazo: datos.es_reemplazo || false,
            semana: datos.semana,
            fecha: datos.fecha,
            estilo: datos.estilo || '',
            tela: datos.tela || '',
            nks: datos.nks || [],
            numero_plotter: datos.numero_plotter || 0,
            plotter_temp: datos.plotter_temp || 0,
            plotter_humedad: datos.plotter_humedad || 0,
            plotter_perfil: datos.plotter_perfil || '',
            monti_numero: datos.monti_numero || 0,
            temperatura_monti: datos.temperatura_monti || 0,
            velocidad_monti: datos.velocidad_monti || 0,
            monti_presion: datos.monti_presion || 0,
            temperatura_flat: datos.temperatura_flat || 0,
            tiempo_flat: datos.tiempo_flat || 0,
            adhesivo: datos.adhesivo || '',
            version: editId ? (datos.esOrdenNueva ? 1 : 2) : 1, // Si es orden nueva, vuelve a versión 1
            editado: editId ? !datos.esOrdenNueva : false, // Solo marcado como editado si NO es orden nueva
            descripcion_edicion: datos.esOrdenNueva ? null : datos.descripcionEdicion,
            observacion: datos.observacion || null,
            reformulacion_estado: datos.reformulacion_estado || 'no_requiere',
            reformulacion_tiempo: datos.reformulacion_tiempo || 0,
            en_produccion: datos.en_produccion || false,
            creado: editId ? null : ahora,
            actualizado: ahora
        };
        
        // Eliminar campos undefined
        Object.keys(registroData).forEach(key => {
            if (registroData[key] === undefined) {
                delete registroData[key];
            }
        });
        
        console.log('📦 Datos a guardar:', registroData);
        
        // Guardar en Supabase
        if (window.SupabaseClient && window.SupabaseClient.client) {
            try {
                const { error } = await window.SupabaseClient.client
                    .from('registros')
                    .upsert(registroData);
                
                if (error) {
                    console.error('❌ Error de Supabase:', error);
                    Notifications.error('Error: ' + (error.message || error.details));
                    return false;
                }
                
                console.log('✅ Guardado en Supabase con ID:', idGenerado);
                
                // Actualizar AppState
                if (editId) {
                    AppState.updateRegistro(editId, registroData);
                } else {
                    AppState.addRegistro(registroData);
                }
                
                Notifications.success('✅ Registro guardado en la nube');
                return true;
                
            } catch (error) {
                console.error('❌ Excepción:', error);
                Notifications.error('Error de conexión: ' + error.message);
                return false;
            }
        } else {
            Notifications.error('❌ Supabase no disponible');
            return false;
        }
    },
    
    eliminar: async function(id) {
        if (!confirm('¿Eliminar este registro?')) return false;
        
        if (window.SupabaseClient && window.SupabaseClient.client) {
            try {
                const { error } = await window.SupabaseClient.client
                    .from('registros')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                console.log('🗑️ Eliminado de Supabase');
            } catch (error) {
                console.error('Error eliminando:', error);
                Notifications.error('Error al eliminar');
                return false;
            }
        }
        
        AppState.deleteRegistro(id);
        Notifications.success('🗑️ Registro eliminado');
        return true;
    },
    
    obtenerFormulario: function() {
        const getValor = (id, defaultValue = '') => {
            const el = document.getElementById(id);
            return el ? el.value : defaultValue;
        };
        
        const getNumero = (id, defaultValue = 0) => {
            const el = document.getElementById(id);
            if (!el) return defaultValue;
            const val = parseFloat(el.value);
            return isNaN(val) ? defaultValue : val;
        };
        
        const getCheck = (id, defaultValue = false) => {
            const el = document.getElementById(id);
            return el ? el.checked : defaultValue;
        };
        
        const fechaStr = getValor('fecha', new Date().toISOString().split('T')[0]);
        const fecha = new Date(fechaStr);
        
        return {
            po: getValor('po', '').toUpperCase(),
            proceso: getValor('proceso', ''),
            es_reemplazo: false, // Ahora se maneja internamente al guardar
            fecha: fechaStr,
            estilo: getValor('estilo', '').toUpperCase(),
            tela: getValor('tela', '').toUpperCase(),
            nks: window.ColorsModule ? window.ColorsModule.obtenerDelFormulario() : [],
            numero_plotter: getNumero('numero_plotter', 0),
            plotter_temp: getNumero('plotter_temp', 0),
            plotter_humedad: getNumero('plotter_humedad', 0),
            plotter_perfil: getValor('plotter_perfil', '').toUpperCase(),
            monti_numero: getNumero('monti_numero', 0),
            temperatura_monti: getNumero('temp_monti', 0),
            velocidad_monti: getNumero('vel_monti', 0),
            monti_presion: getNumero('monti_presion', 0),
            temperatura_flat: getNumero('temp_flat', 0),
            tiempo_flat: getNumero('tiempo_flat', 0),
            adhesivo: getValor('adhesivo', '').toUpperCase(),
            observacion: getValor('observacion', null),
            reformulacion_estado: getValor('reformulacionEstado', 'no_requiere'),
            reformulacion_tiempo: getNumero('reformulacionTiempo', 0),
            descripcionEdicion: null,
            semana: Utils.obtenerSemana(fecha)
        };
    },
    
    cargarFormulario: function(reg) {
        const setValor = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.value = (valor !== undefined && valor !== null) ? valor : '';
        };
        
        const setCheck = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.checked = valor || false;
        };
        
        setValor('po', reg.po);
        setValor('proceso', reg.proceso);
        setValor('fecha', reg.fecha);
        setValor('estilo', reg.estilo);
        setValor('tela', reg.tela);
        
        if (window.ColorsModule && window.ColorsModule.cargarEnFormulario) {
            // Usar reg.nks (nueva estructura) o reg.colores (legacy)
            const datosColores = reg.nks || (reg.colores ? [{ nk: reg.tela || 'SIN NK', colores: reg.colores }] : []);
            window.ColorsModule.cargarEnFormulario(datosColores);
        }
        
        setValor('numero_plotter', reg.numero_plotter);
        setValor('plotter_temp', reg.plotter_temp);
        setValor('plotter_humedad', reg.plotter_humedad);
        setValor('plotter_perfil', reg.plotter_perfil);
        setValor('monti_numero', reg.monti_numero);
        setValor('temp_monti', reg.temperatura_monti);
        setValor('vel_monti', reg.velocidad_monti);
        setValor('monti_presion', reg.monti_presion);
        setValor('temp_flat', reg.temperatura_flat);
        setValor('tiempo_flat', reg.tiempo_flat);
        setValor('adhesivo', reg.adhesivo);
        setValor('reformulacionEstado', reg.reformulacion_estado || 'no_requiere');
        setValor('reformulacionTiempo', reg.reformulacion_tiempo || 0);
        
        // Mostrar/ocultar tiempo según estado
        const tiempoRow = document.getElementById('reformulacionTiempoRow');
        if (tiempoRow) tiempoRow.style.display = (reg.reformulacion_estado === 'reformulado') ? 'block' : 'none';

        if (reg.observacion) setValor('observacion', reg.observacion);
    },
    
    cargarDatosPrellenados: function(datos) {
        console.log('Cargando datos pre-llenados:', datos);
        
        const setValor = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.value = (valor !== undefined && valor !== null) ? valor : '';
        };
        
        setValor('po', datos.po);
        setValor('estilo', datos.estilo);
        setValor('tela', datos.tela || '');
        
        if (window.ColorsModule && window.ColorsModule.cargarEnFormulario) {
            window.ColorsModule.cargarEnFormulario(datos.colores || []);
        }
        
        Notifications.info('📋 Formulario pre-llenado');
        document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
};

window.RecordsModule = RecordsModule;
console.log('✅ RecordsModule actualizado - SIN usuarioModifico');
