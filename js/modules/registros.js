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
        colores: ColoresModule.obtenerColoresDeFormulario(),  // ← Esta línea corregida
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
    
    eliminar: async function(id) {
        if (confirm('¿Eliminar este registro?')) {
            AppState.registros = AppState.registros.filter(r => r.id !== id);
            delete AppState.historialEdiciones[id];
            if(window.SupabaseClient && window.SupabaseClient.client) {
                await SupabaseClient.eliminarRegistro(id);
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
            colores: ColoresModule.obtenerColoresDeFormulario(),
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
        ColoresModule.cargar(reg.colores);
    }
};

window.RegistrosModule = RegistrosModule;
console.log('✅ RegistrosModule cargado');
