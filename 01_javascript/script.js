document.addEventListener('DOMContentLoaded', () => {
    // Initialize Flatpickr for date inputs
    const flatpickrConfig = {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true,
        disableMobile: true
    };

    if (document.getElementById('booking-date')) flatpickr("#booking-date", flatpickrConfig);
    if (document.getElementById('event-date')) flatpickr("#event-date", flatpickrConfig);

    // Navigation
    const btnAddReservation = document.getElementById('btn-add-reservation');
    const viewHome = document.getElementById('view-home');
    const viewReservation = document.getElementById('view-new-reservation');
    const viewChecklist = document.getElementById('view-checklist');
    const btnFilter = document.getElementById('btn-filter');
    const navItems = document.querySelectorAll('.nav-item');

    function switchView(viewId) {
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
            if (viewId === 'view-checklist') {
                btnFilter.classList.remove('hidden');
            } else {
                btnFilter.classList.add('hidden');
            }
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

    function updateIndicator() {
        const indicator = document.getElementById('nav-indicator');
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav && indicator) {
            const topPosition = activeNav.offsetTop;
            const offset = (activeNav.offsetHeight - 40) / 2;
            indicator.style.transform = `translateY(${topPosition + offset}px)`;
        }
    }

    updateIndicator();

    if (btnAddReservation) btnAddReservation.addEventListener('click', () => switchView('view-new-reservation'));

    document.getElementById('nav-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-home');
    });

    document.getElementById('nav-reservations')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-checklist');
    });

    // Dummy Data for Checklist
    const dummyReservations = [
        { nro: 1, estado: 'Pendiente', cliente: 'Ramiro Octavio', fechaReserva: '10/05/2023', uso: 'Baby Shower', fechaEvento: '15/06/2023', servicios: 'No' },
        { nro: 2, estado: 'Pendiente', cliente: 'Amanda Griselda', fechaReserva: '11/05/2023', uso: 'Cumpleaños', fechaEvento: '20/07/2023', servicios: 'Si' },
        { nro: 3, estado: 'Pendiente', cliente: 'Ricardo Sosa', fechaReserva: '12/05/2023', uso: 'Cumpleaños', fechaEvento: '25/08/2022', servicios: 'Si' },
        { nro: 4, estado: 'Pagado', cliente: 'Lucia Fernandez', fechaReserva: '13/05/2023', uso: 'Boda', fechaEvento: '14/04/2022', servicios: 'No' },
        { nro: 5, estado: 'Pendiente', cliente: 'Marcos Ruiz', fechaReserva: '14/05/2023', uso: 'Cumpleaños', fechaEvento: '26/04/2022', servicios: 'Si' },
        { nro: 6, estado: 'Pendiente', cliente: 'Elena Gomez', fechaReserva: '15/05/2023', uso: 'Reunión', fechaEvento: '21/04/2022', servicios: 'Si' },
        { nro: 7, estado: 'Pagado', cliente: 'Aquiles Garcia', fechaReserva: '16/05/2023', uso: 'baile/joda', fechaEvento: '21/11/2022', servicios: 'Si' }
    ];

    let activeReservations = [...dummyReservations];
    let currentSort = { field: null, direction: 'asc' };

    function renderReservations(data = activeReservations) {
        const list = document.getElementById('reservations-list');
        if (!list) return;
        list.innerHTML = '';
        data.forEach(res => {
            const statusClass = res.estado === 'Pagado' ? 'status-paid' : 'status-pending';
            const row = document.createElement('div');
            row.className = 'reservation-card';
            row.innerHTML = `
                <div class="col-nro">${res.nro}</div>
                <div class="col-estado"><span class="status ${statusClass}">${res.estado}</span></div>
                <div class="col-cliente">${res.cliente}</div>
                <div class="col-fecha-reserva">${res.fechaReserva}</div>
                <div class="col-uso">${res.uso}</div>
                <div class="col-fecha-evento">${res.fechaEvento}</div>
                <div class="col-servicios">${res.servicios}</div>
                <div class="col-actions">
                    ${res.estado === 'Pendiente' ? '<button class="btn-cancel">Cancelar</button>' : ''}
                    <button class="btn-view">Ver</button>
                    <button class="btn-more">
                        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                            <path d="M116,64a12,12,0,1,1,12,12A12.01375,12.01375,0,0,1,116,64Zm12,52a12,12,0,1,0,12,12A12.01375,12.01375,0,0,0,128,116Zm0,64a12,12,0,1,0,12,12A12.01375,12.01375,0,0,0,128,180Z" 
                                  fill="currentColor" 
                                  stroke="currentColor" 
                                  stroke-width="12"/>
                        </svg>
                    </button>
                </div>
            `;
            list.appendChild(row);
        });
    }

    function sortReservations(field) {
        if (currentSort.field === field) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.field = field;
            currentSort.direction = 'asc';
        }

        activeReservations.sort((a, b) => {
            let valA = a[field];
            let valB = b[field];

            if (field.toLowerCase().includes('fecha')) {
                const partsA = valA.split('/').map(Number);
                const partsB = valB.split('/').map(Number);
                valA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
                valB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
            }

            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderReservations(activeReservations);
    }

    // Header sort events
    document.querySelectorAll('.checklist-header [data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            sortReservations(header.dataset.sort);
        });
    });

    // Filter Panel logic
    const filterPanel = document.getElementById('filter-panel');
    if (btnFilter && filterPanel) {
        btnFilter.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
            btnFilter.classList.toggle('active');
        });
    }

    // Filter Date Pickers
    if (document.getElementById('filter-date-from')) flatpickr("#filter-date-from", { dateFormat: "d/m/Y", locale: "es", disableMobile: true });
    if (document.getElementById('filter-date-to')) flatpickr("#filter-date-to", { dateFormat: "d/m/Y", locale: "es", disableMobile: true });

    function parseDate(dateStr) {
        if (!dateStr) return null;
        const separator = dateStr.includes('-') ? '-' : '/';
        const parts = dateStr.split(separator).map(Number);
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

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
                    if (dateFrom) {
                        const from = parseDate(dateFrom);
                        if (resDate < from) matchesDate = false;
                    }
                    if (dateTo) {
                        const to = parseDate(dateTo);
                        if (resDate > to) matchesDate = false;
                    }
                }
                return matchesStatus && matchesName && matchesId && matchesDate;
            });

            renderReservations(activeReservations);
        });
    }

    renderReservations();

    // AC Logic
    const acToggle = document.getElementById('ac-toggle');
    const acControls = document.getElementById('ac-controls');
    const hoursInput = document.getElementById('ac-hours');

    if (acToggle) {
        acToggle.addEventListener('change', (e) => {
            if (e.target.checked && acControls) acControls.classList.add('active');
            else if (acControls) acControls.classList.remove('active');
            calculateTotal();
        });
    }

    const hoursMinus = document.getElementById('hours-minus');
    const hoursPlus = document.getElementById('hours-plus');

    if (hoursMinus) {
        hoursMinus.addEventListener('click', () => {
            let val = parseInt(hoursInput.value) || 0;
            if (val > 1) {
                hoursInput.value = val - 1;
                calculateTotal();
            }
        });
    }

    if (hoursPlus) {
        hoursPlus.addEventListener('click', () => {
            let val = parseInt(hoursInput.value) || 0;
            hoursInput.value = val + 1;
            calculateTotal();
        });
    }

    // Auto Calculate Balance
    const priceRent = document.getElementById('price-rent');
    const priceDeposit = document.getElementById('price-deposit');
    const priceBalance = document.getElementById('price-balance');
    const acRate = document.getElementById('ac-rate');

    function calculateTotal() {
        if (!priceRent || !priceBalance) return;
        let rent = parseFloat(priceRent.value) || 0;
        let acCost = 0;
        if (acToggle && acToggle.checked && hoursInput && acRate) {
            let hours = parseInt(hoursInput.value) || 0;
            let rate = parseFloat(acRate.value) || 0;
            acCost = hours * rate;
        }
        let total = rent + acCost;
        let deposit = parseFloat(priceDeposit.value) || 0;
        let balance = total - deposit;
        if (balance < 0) balance = 0;
        priceBalance.value = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '$ ');
    }

    [priceRent, priceDeposit, acRate, hoursInput].forEach(input => {
        input?.addEventListener('input', calculateTotal);
    });
});
