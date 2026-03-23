// js/supabase/client.js
const SupabaseClient = {
    client: null,
    
    init: function() {
        if(!window.SUPABASE_CONFIG) {
            console.error('❌ SUPABASE_CONFIG no definido');
            return false;
        }
        
        if(!window.supabase) {
            console.error('❌ Librería Supabase no cargada');
            return false;
        }
        
        this.client = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        console.log('✅ Supabase cliente inicializado');
        return true;
    },
    
    getRegistros: async function() {
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tabla)
            .select('*')
            .order('creado', { ascending: false });
        
        if(error) {
            console.error('Error cargando registros:', error);
            return null;
        }
        return data;
    },
    
    guardarRegistro: async function(registro) {
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tabla)
            .upsert(registro)
            .select();
        
        if(error) {
            console.error('Error guardando registro:', error);
            return null;
        }
        return data;
    },
    
    eliminarRegistro: async function(id) {
        const { error } = await this.client
            .from(SUPABASE_CONFIG.tabla)
            .delete()
            .eq('id', id);
        
        if(error) {
            console.error('Error eliminando registro:', error);
            return false;
        }
        return true;
    },
    
    guardarHistorial: async function(historialData) {
        const { error } = await this.client
            .from(SUPABASE_CONFIG.tablaHistorial)
            .insert(historialData);
        
        if(error) console.error('Error guardando historial:', error);
        return !error;
    }
};

window.SupabaseClient = SupabaseClient;
console.log('✅ SupabaseClient cargado');