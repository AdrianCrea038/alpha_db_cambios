// ==================== SINCRONIZACIÓN CON ONEDRIVE ====================

const SharePointSync = {
    // Subir backup a OneDrive
    uploadBackup: async function(filename, content) {
        const client = SharePointAuth.getClient();
        if (!client) {
            Notifications.error('❌ No conectado a OneDrive');
            return false;
        }
        
        this._showProgress('Subiendo a OneDrive...');
        
        try {
            const folderId = await this._ensureBackupFolder();
            if (!folderId) throw new Error('No se pudo acceder a la carpeta');
            
            const blob = new Blob([content], { type: 'application/json' });
            const uploadUrl = `/me/drive/items/${folderId}:/${filename}:/content`;
            
            await client.api(uploadUrl).put(blob);
            
            this._hideProgress();
            Notifications.success(`✅ Archivo ${filename} subido a OneDrive`);
            return true;
            
        } catch (error) {
            console.error('Error subiendo a OneDrive:', error);
            this._hideProgress();
            Notifications.error('❌ Error al subir archivo');
            return false;
        }
    },
    
    // Descargar backup desde OneDrive
    downloadBackup: async function(filename) {
        const client = SharePointAuth.getClient();
        if (!client) {
            Notifications.error('❌ No conectado a OneDrive');
            return null;
        }
        
        this._showProgress('Descargando desde OneDrive...');
        
        try {
            const folderId = await this._ensureBackupFolder();
            if (!folderId) throw new Error('No se pudo acceder a la carpeta');
            
            const searchResponse = await client.api(`/me/drive/items/${folderId}/children`)
                .filter(`name eq '${filename}'`)
                .get();
            
            if (!searchResponse.value || searchResponse.value.length === 0) {
                this._hideProgress();
                Notifications.info(`⚠️ Archivo ${filename} no encontrado en OneDrive`);
                return null;
            }
            
            const fileId = searchResponse.value[0].id;
            const contentResponse = await client.api(`/me/drive/items/${fileId}/content`).get();
            
            this._hideProgress();
            const text = await contentResponse.text();
            return text;
            
        } catch (error) {
            console.error('Error descargando desde OneDrive:', error);
            this._hideProgress();
            Notifications.error('❌ Error al descargar archivo');
            return null;
        }
    },
    
    // Listar backups disponibles
    listBackups: async function() {
        const client = SharePointAuth.getClient();
        if (!client) return [];
        
        try {
            const folderId = await this._ensureBackupFolder();
            if (!folderId) return [];
            
            const response = await client.api(`/me/drive/items/${folderId}/children`)
                .filter("name endswith '.adb'")
                .orderby("lastModifiedDateTime desc")
                .get();
            
            if (!response.value) return [];
            
            return response.value.map(f => ({
                name: f.name,
                modified: new Date(f.lastModifiedDateTime).toLocaleString(),
                id: f.id,
                size: f.size
            }));
            
        } catch (error) {
            console.error('Error listando backups:', error);
            return [];
        }
    },
    
    // Restaurar desde backup
    restoreBackup: async function(filename) {
        const content = await this.downloadBackup(filename);
        if (!content) return false;
        
        try {
            const importedData = JSON.parse(content);
            
            if (!importedData.registros || !Array.isArray(importedData.registros)) {
                throw new Error('Estructura de archivo inválida');
            }
            
            if (confirm(`¿Restaurar ${importedData.registros.length} registros desde ${filename}?`)) {
                AppState.setRegistros(importedData.registros);
                AppState.historialEdiciones = importedData.historial || {};
                
                // Guardar en localStorage
                const dataToSave = {
                    registros: AppState.registros,
                    historial: AppState.historialEdiciones
                };
                localStorage.setItem(APP_CONFIG.sistema.localStorageKey, JSON.stringify(dataToSave));
                
                // Actualizar UI
                FormularioUI.reset();
                TablaUI.actualizar();
                CalendarioUI.actualizar();
                
                Notifications.success(`✅ Restaurados ${AppState.registros.length} registros desde ${filename}`);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error restaurando backup:', error);
            Notifications.error('❌ Archivo de backup inválido');
            return false;
        }
    },
    
    // Mostrar selector de archivos
    showFileSelector: async function() {
        const backups = await this.listBackups();
        
        if (backups.length === 0) {
            Notifications.info('📭 No hay backups en OneDrive');
            return;
        }
        
        // Crear modal de selección
        const modalContent = `
            <div class="modal" id="onedriveFileModal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <div class="modal-header-left">
                            <span class="modal-icon">☁️</span>
                            <h3>SELECCIONAR BACKUP</h3>
                        </div>
                        <button class="modal-close" onclick="SharePointSync.closeFileSelector()">✕</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 1rem;">Selecciona un archivo para restaurar:</p>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                            ${backups.map(file => `
                                <button onclick="SharePointSync.restoreBackup('${file.name}')" 
                                        style="background: #2a2a2a; padding: 0.8rem; border: 1px solid #0078d4; border-radius: 0.6rem; cursor: pointer; text-align: left; width: 100%;">
                                    <div style="font-weight: 600; color: white;">📄 ${file.name}</div>
                                    <div style="font-size: 0.7rem; color: #888;">Modificado: ${file.modified}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="SharePointSync.closeFileSelector()">CANCELAR</button>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal existente si hay
        const existingModal = document.getElementById('onedriveFileModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
    },
    
    // Cerrar selector de archivos
    closeFileSelector: function() {
        const modal = document.getElementById('onedriveFileModal');
        if (modal) modal.remove();
    },
    
    // Asegurar que existe la carpeta de backups
    _ensureBackupFolder: async function() {
        const client = SharePointAuth.getClient();
        if (!client) return null;
        
        try {
            const response = await client.api('/me/drive/root/children')
                .filter(`name eq '${APP_CONFIG.backup.folderName}'`)
                .get();
            
            if (response.value && response.value.length > 0) {
                return response.value[0].id;
            }
            
            const folderData = {
                name: APP_CONFIG.backup.folderName,
                folder: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            };
            
            const newFolder = await client.api('/me/drive/root/children').post(folderData);
            return newFolder.id;
            
        } catch (error) {
            console.error('Error creando carpeta:', error);
            return null;
        }
    },
    
    // Mostrar progreso
    _showProgress: function(message) {
        let div = document.getElementById('syncProgress');
        if (div) div.remove();
        
        div = document.createElement('div');
        div.id = 'syncProgress';
        div.className = 'sync-progress';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="spinner"></span>
                <span>☁️ ${message}</span>
            </div>
        `;
        document.body.appendChild(div);
    },
    
    // Ocultar progreso
    _hideProgress: function() {
        const div = document.getElementById('syncProgress');
        if (div) div.remove();
    }
};

// Exponer funciones globales
window.SharePointSync = SharePointSync;
console.log('✅ SharePointSync cargado');