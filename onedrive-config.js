// onedrive-config.js - CONFIGURACIÓN DE AZURE AD Y SHAREPOINT
// REEMPLAZA TU_CLIENT_ID_AQUI con el Client ID de tu aplicación en Azure
// REEMPLAZA TUEMPRESA con tu dominio de Office 365

const ONEDRIVE_CONFIG = {
    // Client ID de tu aplicación registrada en Azure AD
    clientId: "TU_CLIENT_ID_AQUI",
    
    // Authority - Usa "common" para cuentas Microsoft personales y de trabajo
    authority: "https://login.microsoftonline.com/common",
    
    // Scopes necesarios para OneDrive y SharePoint
    scopes: ["Files.ReadWrite", "Files.ReadWrite.All", "User.Read", "Sites.ReadWrite.All"],
    
    // Redirección URI (debe coincidir con lo registrado en Azure)
    redirectUri: window.location.origin + window.location.pathname,
    
    // Carpeta en OneDrive donde se guardarán los archivos
    folderName: "AlphaDB_Backups",
    
    // CONFIGURACIÓN DE SHAREPOINT
    sharepoint: {
        // Tu sitio de SharePoint - REEMPLAZA TUEMPRESA Y TUSITIO
        siteUrl: "https://TUEMPRESA.sharepoint.com/sites/TUSITIO",
        listName: "AlphaDB_Registros"
    }
};

// Exportar para uso global
window.ONEDRIVE_CONFIG = ONEDRIVE_CONFIG;

console.log('✅ onedrive-config.js cargado correctamente');
console.log('📌 Client ID configurado:', ONEDRIVE_CONFIG.clientId === "TU_CLIENT_ID_AQUI" ? '⚠️ REEMPLAZAR CON TU CLIENT ID REAL' : '✓ OK');
console.log('📌 SharePoint Site:', ONEDRIVE_CONFIG.sharepoint.siteUrl);
