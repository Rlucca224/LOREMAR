import { generateDummyData } from './data.js';
import { parseDate, applyDateMask } from './utils.js';
import { switchView, updateIndicator, showModal, hideModal, setupFilterToggle } from './ui.js';
import { renderReservations } from './reservations-renderer.js';

// Estado Global
let dummyReservations = [];
let activeReservations = [];
let currentPage = 1;
const itemsPerPage = 20;
let currentSort = { field: 'nro', direction: 'asc' };
let successAnimation = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Datos
    dummyReservations = generateDummyData();
    activeReservations = [...dummyReservations];

    // 2. Inicializar Lottie Animation
    const lottieContainer = document.getElementById('lottie-success');
    if (lottieContainer) {
        successAnimation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '../09_SVG/tick mark animtion.json'
        });
    }

    // 3. Configurar Flatpickr y Inputs
    const flatpickrConfig = {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true,
        disableMobile: true
    };

    // Inputs del formulario de reserva + filtros
    ['booking-date', 'event-date', 'filter-date-from', 'filter-date-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            flatpickr(el, flatpickrConfig);
            applyDateMask(el);
        }
    });

    // 4. Inicializar Navegación
    const btnAddReservation = document.getElementById('btn-add-reservation');
    if (btnAddReservation) btnAddReservation.addEventListener('click', () => switchView('view-new-reservation'));

    document.getElementById('nav-home')?.addEventListener('click', (e) => { e.preventDefault(); switchView('view-home'); });
    document.getElementById('nav-reservations')?.addEventListener('click', (e) => { e.preventDefault(); switchView('view-checklist'); });

    // 5. Lógica de Modal de Eliminación
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.querySelector('.modal-btn-cancel')?.addEventListener('click', () => hideModal('delete-modal'));
        deleteModal.querySelector('.modal-btn-confirm')?.addEventListener('click', () => {
            const id = parseInt(deleteModal.dataset.reservationToDelete);
            if (id) {
                const index = dummyReservations.findIndex(r => r.nro === id);
                if (index !== -1) {
                    dummyReservations.splice(index, 1);
                    filterReservations(); // Actualiza activeReservations
                    console.log(`Reserva #${id} eliminada.`);
                }
            }
            hideModal('delete-modal');
        });
    }

    // 6. Lógica de Nueva Reserva (Form Submit)
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Elementos para cálculo de saldo (Selección local)
            const pBalance = document.getElementById('price-balance');

            // Capturar Datos
            const clientName = document.getElementById('client-name').value;
            const eventType = document.getElementById('event-type').value;
            const eventDate = document.getElementById('event-date').value;
            const hasAC = document.getElementById('ac-toggle').checked;
            const serviciosStr = hasAC ? "Si" : "No";

            const currentBalanceStr = pBalance ? pBalance.value.replace(/[^0-9.-]+/g, "") : "0";
            const currentBalance = parseFloat(currentBalanceStr) || 0;
            const estado = currentBalance <= 0 ? "Pagado" : "Pendiente";

            const maxId = dummyReservations.reduce((max, r) => Math.max(max, parseInt(r.nro)), 0);

            const newReservation = {
                nro: maxId + 1,
                estado: estado,
                cliente: clientName || "Cliente Sin Nombre",
                fechaReserva: new Date().toLocaleDateString('es-ES'),
                uso: eventType || "Evento",
                fechaEvento: eventDate || "Fecha a confirmar",
                servicios: serviciosStr
            };

            dummyReservations.unshift(newReservation);
            filterReservations();

            // Mostrar Modal Éxito
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                showModal('success-modal');
                if (successAnimation) successAnimation.goToAndPlay(0, true);

                setTimeout(() => {
                    hideModal('success-modal');
                    reservationForm.reset();
                    if (pBalance) pBalance.value = "Total";
                    switchView('view-checklist');
                }, 4000);
            }
        });
    }

    // 7. AC Logic (Toggle)
    const acToggle = document.getElementById('ac-toggle');
    const acControls = document.getElementById('ac-controls');
    if (acToggle) {
        acToggle.addEventListener('change', (e) => {
            if (e.target.checked && acControls) acControls.classList.add('active');
            else if (acControls) acControls.classList.remove('active');
        });
    }

    const hoursInput = document.getElementById('ac-hours');
    document.getElementById('hours-plus')?.addEventListener('click', () => {
        if (hoursInput) hoursInput.value = (parseInt(hoursInput.value) || 0) + 1;
    });
    document.getElementById('hours-minus')?.addEventListener('click', () => {
        if (hoursInput && hoursInput.value > 1) hoursInput.value = parseInt(hoursInput.value) - 1;
    });


    // 8. Lógica de Ordenamiento y Filtros
    setupSorting();
    setupFilters();

    // 9. Render Inicial
    refreshList();
});

// Helpers locales para main
function setupSorting() {
    document.querySelectorAll('.checklist-header [data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }

            // Ordenar página actual
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = activeReservations.slice(start, end);

            pageItems.sort((a, b) => {
                let valA = a[field];
                let valB = b[field];
                if (field.toLowerCase().includes('fecha')) {
                    valA = parseDate(valA);
                    valB = parseDate(valB);
                }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
            activeReservations.splice(start, pageItems.length, ...pageItems);
            refreshList();
        });
    });
}

function setupFilters() {
    setupFilterToggle(); // Nueva llamada

    const btnSearchApply = document.getElementById('btn-search-apply');
    if (btnSearchApply) {
        btnSearchApply.addEventListener('click', () => {
            const status = document.getElementById('filter-status')?.value;
            const name = document.getElementById('filter-name')?.value.toLowerCase();
            const clientId = document.getElementById('filter-client-id')?.value;
            const dateFrom = document.getElementById('filter-date-from')?.value;
            const dateTo = document.getElementById('filter-date-to')?.value;

            activeReservations = dummyReservations.filter(res => {
                const matchesStatus = !status || res.estado === status;
                const matchesName = !name || res.cliente.toLowerCase().includes(name);
                const matchesId = !clientId || res.nro.toString() === clientId;

                let matchesDate = true;
                if (dateFrom || dateTo) {
                    const resDate = parseDate(res.fechaReserva);
                    if (dateFrom && resDate < parseDate(dateFrom)) matchesDate = false;
                    if (dateTo && resDate > parseDate(dateTo)) matchesDate = false;
                }
                return matchesStatus && matchesName && matchesId && matchesDate;
            });

            currentPage = 1;
            refreshList();
        });
    }
}

function refreshList() {
    renderReservations(activeReservations, currentPage, itemsPerPage, {
        onPageChange: (newPage) => {
            currentPage = newPage;
            refreshList();
        },
        onDeleteRequest: (id) => {
            const modal = document.getElementById('delete-modal');
            if (modal) {
                modal.dataset.reservationToDelete = id;
                showModal('delete-modal');
            }
        },
        onEditRequest: (res) => console.log("Editar", res)
    });
}

function filterReservations() {
    activeReservations = [...dummyReservations];
    refreshList();
}
