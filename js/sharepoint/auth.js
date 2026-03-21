// ==================== AUTENTICACIÓN CON AZURE AD ====================

let msalInstance = null;
let graphClient = null;
let isConnected = false;

const SharePointAuth = {
    init: function() {
        console.log('🔄 Inicializando autenticación SharePoint...');
        
        const MsalClass = this._detectarMSAL();
        if (!MsalClass) {
            console.warn('⚠️ MSAL no detectado, usando modo local');
            return;
        }
        
        try {
            msalInstance = new MsalClass({
                auth: {
                    clientId: APP_CONFIG.azure.clientId,
                    authority: APP_CONFIG.azure.authority,
                    redirectUri: APP_CONFIG.azure.redirectUri
                },
                cache: {
                    cacheLocation: "localStorage",
                    storeAuthStateInCookie: true
                }
            });
            
            console.log('✅ MSAL instanciado correctamente');
            this._verificarSesion();
        } catch (error) {
            console.error('❌ Error inicializando MSAL:', error);
        }
    },
    
    _detectarMSAL: function() {
        if (typeof window.PublicClientApplication !== 'undefined') {
            console.log('✅ MSAL como window.PublicClientApplication');
            return window.PublicClientApplication;
        }
        if (window.msal && window.msal.PublicClientApplication) {
            console.log('✅ MSAL como window.msal.PublicClientApplication');
            return window.msal.PublicClientApplication;
        }
        if (typeof msal !== 'undefined' && msal.PublicClientApplication) {
            console.log('✅ MSAL como msal.PublicClientApplication');
            return msal.PublicClientApplication;
        }
        return null;
    },
    
    _verificarSesion: async function() {
        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                await this._obtenerTokenSilencioso(accounts[0]);
                this._actualizarEstado(true);
            } else {
                this._actualizarEstado(false);
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            this._actualizarEstado(false);
        }
    },
    
    _obtenerTokenSilencioso: async function(account) {
        const request = {
            scopes: APP_CONFIG.azure.scopes,
            account: account
        };
        
        try {
            const response = await msalInstance.acquireTokenSilent(request);
            graphClient = MicrosoftGraph.Client.init({
                authProvider: (done) => done(null, response.accessToken)
            });
            isConnected = true;
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    login: async function() {
        if (!msalInstance) {
            Notifications.error('❌ Configuración de OneDrive no disponible');
            return false;
        }
        
        try {
            const request = {
                scopes: APP_CONFIG.azure.scopes,
                prompt: "select_account"
            };
            
            const response = await msalInstance.loginPopup(request);
            if (response.account) {
                await this._obtenerTokenSilencioso(response.account);
                this._actualizarEstado(true);
                Notifications.success('✅ Conectado a SharePoint exitosamente');
                return true;
            }
        } catch (error) {
            console.error('Error en login:', error);
            Notifications.error('❌ Error al conectar con SharePoint');
            this._actualizarEstado(false);
            return false;
        }
    },
    
    _actualizarEstado: function(connected) {
        isConnected = connected;
        const statusDiv = document.getElementById('onedriveStatus');
        const syncBtn = document.getElementById('syncOnedriveBtn');
        
        if (statusDiv) {
            if (connected) {
                statusDiv.className = 'sync-status connected';
                statusDiv.innerHTML = '<span>☁️✅</span> SharePoint: Conectado';
                if (syncBtn) syncBtn.innerHTML = '<span>🔄</span> Sincronizar';
            } else {
                statusDiv.className = 'sync-status disconnected';
                statusDiv.innerHTML = '<span>☁️🔌</span> SharePoint: Desconectado';
            }
        }
    },
    
    getToken: async function() {
        if (!msalInstance) return null;
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            const logged = await this.login();
            if (!logged) return null;
        }
        return this._obtenerTokenSilencioso(msalInstance.getAllAccounts()[0]);
    },
    
    getClient: function() {
        return graphClient;
    },
    
    isConnected: function() {
        return isConnected;
    }
};

window.SharePointAuth = SharePointAuth;