// js/core/notifications.js
const Notifications = {
    mostrar: function(mensaje, tipo = 'success') {
        const notificacion = document.createElement('div');
        const colores = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 0.8rem 1.5rem;
            background: ${colores[tipo] || colores.success};
            color: white;
            border-radius: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: 500;
            font-family: 'Inter', sans-serif;
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s';
            setTimeout(() => document.body.removeChild(notificacion), 300);
        }, 2500);
    },
    
    success: function(msg) { this.mostrar(msg, 'success'); },
    error: function(msg) { this.mostrar(msg, 'error'); },
    info: function(msg) { this.mostrar(msg, 'info'); },
    warning: function(msg) { this.mostrar(msg, 'warning'); }
};

window.Notifications = Notifications;
console.log('✅ Notifications cargado');