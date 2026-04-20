/* ============================================================
   js/modules/calendar.js - Calendario Mensual con Navegación
   ============================================================ */

const CalendarUI = {
    meses: [
        { nombre: 'Enero',      semanas: [1, 2, 3, 4] },
        { nombre: 'Febrero',    semanas: [5, 6, 7, 8, 9] },
        { nombre: 'Marzo',      semanas: [10, 11, 12, 13] },
        { nombre: 'Abril',      semanas: [14, 15, 16, 17, 18] },
        { nombre: 'Mayo',       semanas: [19, 20, 21, 22] },
        { nombre: 'Junio',      semanas: [23, 24, 25, 26] },
        { nombre: 'Julio',      semanas: [27, 28, 29, 30, 31] },
        { nombre: 'Agosto',     semanas: [32, 33, 34, 35] },
        { nombre: 'Septiembre', semanas: [36, 37, 38, 39] },
        { nombre: 'Octubre',    semanas: [40, 41, 42, 43, 44] },
        { nombre: 'Noviembre',  semanas: [45, 46, 47, 48] },
        { nombre: 'Diciembre',  semanas: [49, 50, 51, 52] }
    ],

    // Mes visible actualmente (0 = Enero, 11 = Diciembre)
    mesActual: new Date().getMonth(),

    actualizar: function() {
        const container = document.getElementById('mesesGrid');
        if (!container) return;

        // Semanas con datos
        const semanasConDatos = new Set();
        if (AppState.registros) {
            AppState.registros.forEach(reg => {
                if (reg.semana) semanasConDatos.add(parseInt(reg.semana));
            });
        }

        const mes = this.meses[this.mesActual];

        let html = `
            <div class="cal-nav">
                <button class="cal-arrow" onclick="CalendarUI.cambiarMes(-1)">&#8249;</button>
                <span class="cal-mes-nombre">${mes.nombre}</span>
                <button class="cal-arrow" onclick="CalendarUI.cambiarMes(1)">&#8250;</button>
            </div>
            <div class="semanas-subgrid">
        `;

        mes.semanas.forEach(s => {
            const isActive = (AppState.currentSemana === s.toString());
            const hasData  = semanasConDatos.has(s);
            html += `
                <div class="semana-mini-btn ${isActive ? 'active' : ''}"
                     onclick="CalendarUI.filtrarPorSemana(${s})"
                     title="Semana ${s}${hasData ? ' — con registros' : ''}">
                    <span>${s}</span>
                    ${hasData ? '<div class="has-data-dot"></div>' : ''}
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        this.actualizarBadge();
    },

    cambiarMes: function(direccion) {
        this.mesActual = (this.mesActual + direccion + 12) % 12;
        this.actualizar();
    },

    filtrarPorSemana: function(semana) {
        const semanaStr = semana.toString();
        if (AppState.currentSemana === semanaStr) {
            AppState.setFiltros(AppState.currentSearch, '');
            if (window.Notifications) Notifications.info('📅 Filtro de semana quitado');
        } else {
            AppState.setFiltros(AppState.currentSearch, semanaStr);
            if (window.Notifications) Notifications.success(`📅 Filtrando Semana ${semana}`);
        }
        this.actualizar();
        if (window.TableUI && TableUI.actualizar) TableUI.actualizar();
    },

    actualizarBadge: function() {
        // Semana real del año
        const ahora     = new Date();
        const inicioAnio = new Date(ahora.getFullYear(), 0, 1);
        const dias      = Math.floor((ahora - inicioAnio) / 86400000);
        const semActual = Math.ceil((dias + inicioAnio.getDay() + 1) / 7);

        const badge = document.getElementById('semanaActualBadge');
        if (badge) badge.textContent = AppState.currentSemana || semActual;

        const filtroBadge = document.getElementById('filtroActivo');
        if (filtroBadge) {
            if (AppState.currentSemana) {
                filtroBadge.style.display = 'inline';
                filtroBadge.innerHTML = `📅 Semana ${AppState.currentSemana}`;
            } else {
                filtroBadge.style.display = 'none';
            }
        }
    },

    init: function() {
        this.actualizar();
    }
};

window.CalendarUI = CalendarUI;
console.log('✅ CalendarUI con navegación mensual cargado');