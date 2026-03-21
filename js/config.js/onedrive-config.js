// CONFIGURACIÓN DE AZURE AD Y SHAREPOINT
const APP_CONFIG = {
    // Azure AD
    azure: {
        clientId: "e5b49e4d-bcc0-4d68-84a2-6ce266488f8a",
        authority: "https://login.microsoftonline.com/common",
        scopes: ["Files.ReadWrite", "Files.ReadWrite.All", "User.Read", "Sites.ReadWrite.All"],
        redirectUri: window.location.origin + window.location.pathname
    },
    
    // SharePoint
    sharepoint: {
        siteUrl: "https://artfxinc-my.sharepoint.com/personal/carlos_milla_tegraglobal_com",
        listName: "AlphaDB_Registros"
    },
    
    // Backup
    backup: {
        folderName: "AlphaDB_Backups",
        extension: ".adb"
    },
    
    // Sistema
    sistema: {
        nombre: "ALPHA DB",
        version: "9.0",
        localStorageKey: "alpha_db_registros_v9"
    }
};

// Verificar que la configuración se cargó
console.log('✅ Configuración cargada');
console.log('📌 SharePoint Site:', APP_CONFIG.sharepoint.siteUrl);
console.log('📌 Client ID:', APP_CONFIG.azure.clientId);