// ==================== ESTADO GLOBAL DE LA APLICACIÓN ====================

const AppState = {
    // Datos
    registros: [],
    
    // Filtros
    currentSearch: '',
    currentSemana: '',
    
    // Edición
    editandoId: null,
    
    // Historial
    historialEdiciones: {},
    
    // Colores
    contadorColores: 1,
    
    // SharePoint
    usandoSharePoint: false,
    
    // Métodos para actualizar estado
    setRegistros: function(data) {
        this.registros = data;
        this._notifyChange();
    },
    
    addRegistro: function(registro) {
        this.registros.unshift(registro);
        this._notifyChange();
    },
    
    updateRegistro: function(id, registro) {
        const index = this.registros.findIndex(r => r.id === id);
        if (index !== -1) {
            this.registros[index] = registro;
            this._notifyChange();
        }
    },
    
    deleteRegistro: function(id) {
        this.registros = this.registros.filter(r => r.id !== id);
        delete this.historialEdiciones[id];
        this._notifyChange();
    },
    
    setFiltros: function(search, semana) {
        this.currentSearch = search;
        this.currentSemana = semana;
        this._notifyChange();
    },
    
    // Método para notificar cambios (para que la UI se actualice)
    _notifyChange: function() {
        if (window.onStateChange) {
            window.onStateChange();
        }
    }
};

window.AppState = AppState;