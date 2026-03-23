// js/ui/formulario.js
const FormularioUI = {
    reset: function() {
        AppState.editandoId = null;
        document.getElementById('editId').value = '';
        document.getElementById('registroForm').reset();
        
        ColoresModule.cargarEnFormulario([]);
        
        const hoy = new Date().toISOString().split('T')[0];
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) fechaInput.value = hoy;
        
        const observacionContainer = document.getElementById('observacionContainer');
        if (observacionContainer) observacionContainer.style.display = 'none';
        
        const observacionField = document.getElementById('observacion');
        if (observacionField) {
            observacionField.required = false;
            observacionField.value = '';
        }
        
        const formTitle = document.getElementById('formTitle');
        if (formTitle) formTitle.innerHTML = '➕ NUEVO REGISTRO';
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.innerHTML = '<span>💾</span> GUARDAR';
        
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) cancelEditBtn.style.display = 'none';
        
        const formSection = document.querySelector('.form-section');
        if (formSection) formSection.classList.remove('edit-mode');
    },
    
    cargarParaEdicion: function(id) {
        const registro = RegistrosModule.getById(id);
        if (!registro) {
            Notifications.error('❌ Registro no encontrado');
            return;
        }
        
        AppState.editandoId = id;
        document.getElementById('editId').value = id;
        
        RegistrosModule.cargarFormulario(registro);
        
        const formTitle = document.getElementById('formTitle');
        if (formTitle) formTitle.innerHTML = '✏️ EDITANDO REGISTRO';
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.innerHTML = '<span>✏️</span> ACTUALIZAR';
        
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) cancelEditBtn.style.display = 'block';
        
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.classList.add('edit-mode');
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        this.verificarFecha();
    },
    
    verificarFecha: function() {
        const fechaInput = document.getElementById('fecha');
        const observacionContainer = document.getElementById('observacionContainer');
        const observacionField = document.getElementById('observacion');
        
        if (!fechaInput || !observacionContainer || !observacionField) return;
        
        const fechaSeleccionada = fechaInput.value;
        const hoy = new Date().toISOString().split('T')[0];
        
        if (fechaSeleccionada < hoy) {
            observacionContainer.style.display = 'block';
            observacionField.required = true;
        } else {
            observacionContainer.style.display = 'none';
            observacionField.required = false;
            observacionField.value = '';
        }
    }
};

window.FormularioUI = FormularioUI;
console.log('✅ FormularioUI cargado');