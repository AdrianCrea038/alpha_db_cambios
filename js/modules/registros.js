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
