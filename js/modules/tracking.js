/* ========== AJUSTE RESPONSIVE MENÚ COLABSADO ========== */
@media (max-width: 768px) {
    .menu-lateral {
        width: 60px;
    }
    
    .menu-lateral:not(.collapsed) {
        width: 220px;
    }
    
    .menu-lateral .menu-toggle {
        right: -12px;
        width: 24px;
        height: 24px;
        font-size: 10px;
    }
    
    .menu-lateral.collapsed .menu-btn {
        padding: 10px 0;
    }
    
    .menu-lateral.collapsed .menu-icon svg {
        width: 18px;
        height: 18px;
    }
    
    .menu-lateral.collapsed .menu-header {
        padding: 15px 0;
    }
    
    .menu-lateral.collapsed .menu-footer {
        padding: 10px 0;
    }
    
    .container {
        margin-left: 60px;
        max-width: calc(100% - 60px);
        padding: 0.6rem;
    }
    
    .menu-lateral:not(.collapsed) ~ .container {
        margin-left: 220px;
        max-width: calc(100% - 220px);
    }
}
