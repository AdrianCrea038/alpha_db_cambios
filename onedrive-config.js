// onedrive-config.js - CONFIGURACIÓN DE AZURE AD
// REEMPLAZA TU_CLIENT_ID_AQUI con el Client ID de tu aplicación en Azure

const ONEDRIVE_CONFIG = {
    // Client ID de tu aplicación registrada en Azure AD
    clientId: "e5b49e4d-bcc0-4d68-84a2-6ce266488f8a",
    
    // Authority (tenant) - Cambia "common" por tu tenant ID si es necesario
    authority: "https://login.microsoftonline.com/common",
    
    // Scopes necesarios para OneDrive
    scopes: ["Files.ReadWrite", "Files.ReadWrite.All", "User.Read"],
    
    // Redirección URI (debe coincidir con lo registrado en Azure)
    redirectUri: window.location.origin + window.location.pathname,
    
    // Carpeta en OneDrive donde se guardarán los archivos
    folderName: "AlphaDB_Backups"
};

// Exportar para uso global
window.ONEDRIVE_CONFIG = ONEDRIVE_CONFIG;