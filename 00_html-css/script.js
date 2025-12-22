document.addEventListener('DOMContentLoaded', () => {
    // Initialize Flatpickr for date inputs
    const flatpickrConfig = {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true,
        disableMobile: true // Use custom UI even on mobile for consistency
    };

    flatpickr("#booking-date", flatpickrConfig);
    flatpickr("#event-date", flatpickrConfig);

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
            if (v.id === viewId) {
                v.classList.remove('hidden');
                v.classList.add('active');
            } else {
                v.classList.add('hidden');
                v.classList.remove('active');
            }
        });

        // Show/Hide filter button only on checklist view
        if (viewId === 'view-checklist') {
            btnFilter.classList.remove('hidden');
        } else {
            btnFilter.classList.add('hidden');
        }

        // Sidebar active state
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
    }

    btnAddReservation.addEventListener('click', () => switchView('view-new-reservation'));

    const navHome = document.getElementById('nav-home');
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-home');
    });

    const navReservations = document.getElementById('nav-reservations');
    navReservations.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-checklist');
    });

    // Dummy Data for Checklist
    const dummyReservations = [
        { nro: 1, estado: 'Pendiente', cliente: 'Ramiro Octavio', fechaReserva: '23-03-2023', uso: 'Baby Shower', fechaEvento: '04-04-2023', servicios: 'No' },
        { nro: 2, estado: 'Pendiente', cliente: 'Amanda Griselda', fechaReserva: '12-05-2023', uso: 'Cumpleaños', fechaEvento: '03-07-2023', servicios: 'Si' },
        { nro: 3, estado: 'Pendiente', cliente: 'Amanda Griselda', fechaReserva: '22-03-2022', uso: 'Cumpleaños', fechaEvento: '21-05-2022', servicios: 'Si' },
        { nro: 4, estado: 'Pagado', cliente: 'Amanda Griselda', fechaReserva: '22-03-2022', uso: 'Boda', fechaEvento: '14-04-2022', servicios: 'No' },
        { nro: 5, estado: 'Pendiente', cliente: 'Amanda Griselda', fechaReserva: '22-03-2022', uso: 'Cumpleaños', fechaEvento: '26-04-2022', servicios: 'Si' },
        { nro: 6, estado: 'Pendiente', cliente: 'Amanda Griselda', fechaReserva: '22-03-2022', uso: 'Cumpleaños', fechaEvento: '21-04-2022', servicios: 'Si' },
        { nro: 7, estado: 'Pagado', cliente: 'Aquiles Garcia', fechaReserva: '09-03-2022', uso: 'baile/joda', fechaEvento: '21-11-2022', servicios: 'Si' }
    ];

    function renderReservations() {
        const list = document.getElementById('reservations-list');
        list.innerHTML = '';
        dummyReservations.forEach(res => {
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
                    <button class="btn-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            `;
            list.appendChild(row);
        });
    }

    renderReservations();

    // AC Logic
    const acToggle = document.getElementById('ac-toggle');
    const acControls = document.getElementById('ac-controls');

    acToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            acControls.classList.add('active');
        } else {
            acControls.classList.remove('active');
        }
        calculateTotal();
    });

    // Stepper Logic
    const hoursMinus = document.getElementById('hours-minus');
    const hoursPlus = document.getElementById('hours-plus');
    const hoursInput = document.getElementById('ac-hours');

    hoursMinus.addEventListener('click', () => {
        let val = parseInt(hoursInput.value) || 0;
        if (val > 1) {
            hoursInput.value = val - 1;
            calculateTotal();
        }
    });

    hoursPlus.addEventListener('click', () => {
        let val = parseInt(hoursInput.value) || 0;
        hoursInput.value = val + 1;
        calculateTotal();
    });

    // Auto Calculate Balance
    const priceRent = document.getElementById('price-rent');
    const priceDeposit = document.getElementById('price-deposit');
    const priceBalance = document.getElementById('price-balance');
    const acRate = document.getElementById('ac-rate');

    function calculateTotal() {
        // Base Rent
        let rent = parseFloat(priceRent.value) || 0;

        // AC Cost
        let acCost = 0;
        if (acToggle.checked) {
            let hours = parseInt(hoursInput.value) || 0;
            let rate = parseFloat(acRate.value) || 0;
            acCost = hours * rate;
        }

        // Total
        let total = rent + acCost;

        // Deposit
        let deposit = parseFloat(priceDeposit.value) || 0;

        // Balance
        let balance = total - deposit;

        if (balance < 0) balance = 0; // Or handle overpayment? usually balance >= 0

        // Format
        priceBalance.value = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '$ ');
    }

    [priceRent, priceDeposit, acRate, hoursInput].forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
});
