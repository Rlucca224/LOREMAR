// ui.js - Lógica general de interfaz de usuario y navegación

export function switchView(viewId) {
    const viewHome = document.getElementById('view-home');
    const viewReservation = document.getElementById('view-new-reservation');
    const viewChecklist = document.getElementById('view-checklist');
    const btnFilter = document.getElementById('btn-filter');
    const navItems = document.querySelectorAll('.nav-item');

    const views = [viewHome, viewReservation, viewChecklist];
    views.forEach(v => {
        if (v && v.id === viewId) {
            v.classList.remove('hidden');
            v.classList.add('active');
        } else if (v) {
            v.classList.add('hidden');
            v.classList.remove('active');
        }
    });

    if (btnFilter) {
        const filterWrapper = document.getElementById('filter-reveal-wrapper');
        if (viewId === 'view-checklist') {
            btnFilter.classList.remove('hidden');
        } else {
            btnFilter.classList.add('hidden');
            // Reset y Hide Filter Panel al salir de la vista
            if (filterWrapper) {
                filterWrapper.classList.remove('active');
                filterWrapper.style.display = 'none';
                btnFilter.classList.remove('active');

                // Nota: El reset de inputs se maneja en main.js si es necesario
            }
        }
    }

    // Control manual de visibilidad para elementos "flotantes"
    const checklistHeader = document.querySelector('.checklist-header');
    const pagination = document.querySelector('.pagination');

    if (viewId === 'view-checklist') {
        if (checklistHeader) checklistHeader.style.display = 'flex';
        if (pagination) pagination.style.display = 'flex';
    } else {
        if (checklistHeader) checklistHeader.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
    }

    let targetNavId = '';
    if (viewId === 'view-home' || viewId === 'view-new-reservation') targetNavId = 'nav-home';
    if (viewId === 'view-checklist') targetNavId = 'nav-reservations';

    navItems.forEach(item => {
        if (item.id === targetNavId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    updateIndicator();
}

export function updateIndicator() {
    const indicator = document.getElementById('nav-indicator');
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav && indicator) {
        const topPosition = activeNav.offsetTop;
        const offset = (activeNav.offsetHeight - 40) / 2;
        indicator.style.transform = `translateY(${topPosition + offset}px)`;
    }
}

export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        const appContainer = document.querySelector('.app-container');
        if (appContainer && modalId === 'success-modal') appContainer.classList.add('modal-active');

        setTimeout(() => modal.classList.add('show'), 10);
    }
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            const appContainer = document.querySelector('.app-container');
            if (appContainer) appContainer.classList.remove('modal-active');
            // ... (existing code) ...
        }, 300);
    }
}

export function setupFilterToggle() {
    const btnFilter = document.getElementById('btn-filter');
    const filterWrapper = document.getElementById('filter-reveal-wrapper');

    if (btnFilter && filterWrapper) {
        btnFilter.addEventListener('click', () => {
            const isActive = filterWrapper.classList.contains('active');

            if (!isActive) {
                // Mover contenido principal hacia abajo si es necesario o solo desplegar
                // En el CSS original, filter-reveal-wrapper empuja el contenido? 
                // Revisando comportamiento original: desplaza contenido.

                filterWrapper.style.display = 'block';
                // Pequeño timeout para permitir render
                setTimeout(() => {
                    filterWrapper.classList.add('active');
                    btnFilter.classList.add('active');
                }, 10);
            } else {
                // Cerrar
                filterWrapper.classList.remove('active');
                btnFilter.classList.remove('active');
                // Esperar transición CSS
                setTimeout(() => {
                    if (!filterWrapper.classList.contains('active')) {
                        filterWrapper.style.display = 'none';
                    }
                }, 400);
            }
        });
    }
}
