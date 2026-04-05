// ============================================================
// js/services/supabase-client.js - Cliente de Supabase
// ============================================================

const SupabaseClient = {
    client: null,
    initialized: false,
    
    init: function() {
        if (this.initialized && this.client) return true;
        
        if (!window.SUPABASE_CONFIG || !window.supabase) {
            console.warn('⚠️ Supabase no disponible, modo offline');
            return false;
        }
        
        try {
            this.client = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            this.initialized = true;
            console.log('✅ Supabase cliente inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            return false;
        }
    },
    
    // ========== USUARIOS ==========
    
    getUsuarios: async function() {
        if (!this.init()) return null;
        
        try {
            const { data, error } = await this.client
                .from('usuarios')
                .select('*')
                .order('creado', { ascending: true });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            return null;
        }
    },
    
    guardarUsuario: async function(usuario) {
        if (!this.init()) return null;
        
        try {
            const { data, error } = await this.client
                .from('usuarios')
                .upsert(usuario)
                .select();
            
            if (error) throw error;
            console.log('✅ Usuario guardado en Supabase:', usuario.username);
            return data;
        } catch (error) {
            console.error('Error guardando usuario:', error);
            return null;
        }
    },
    
    eliminarUsuario: async function(id) {
        if (!this.init()) return false;
        
        try {
            const { error } = await this.client
                .from('usuarios')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            console.log('✅ Usuario eliminado de Supabase:', id);
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return false;
        }
    },
    
    // ========== REGISTROS ==========
    
    getRegistros: async function() {
        if (!this.init()) return null;
        
        try {
            const { data, error } = await this.client
                .from('registros')
                .select('*')
                .order('creado', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error cargando registros:', error);
            return null;
        }
    },
    
    guardarRegistro: async function(registro) {
        if (!this.init()) return null;
        
        try {
            const { data, error } = await this.client
                .from('registros')
                .upsert(registro)
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando registro:', error);
            return null;
        }
    },
    
    eliminarRegistro: async function(id) {
        if (!this.init()) return false;
        
        try {
            const { error } = await this.client
                .from('registros')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando registro:', error);
            return false;
        }
    },
    
    guardarHistorial: async function(historialData) {
        if (!this.init()) return false;
        
        try {
            const { error } = await this.client
                .from('historial')
                .insert(historialData);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error guardando historial:', error);
            return false;
        }
    }
};

window.SupabaseClient = SupabaseClient;
console.log('✅ SupabaseClient cargado');
