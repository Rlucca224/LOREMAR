document.addEventListener('DOMContentLoaded', () => {
    // Initialize Flatpickr for date inputs
    const flatpickrConfig = {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true,
        disableMobile: true
    };

    if (document.getElementById('booking-date')) {
        const el = document.getElementById('booking-date');
        flatpickr(el, flatpickrConfig);
        applyDateMask(el);
    }
    if (document.getElementById('event-date')) {
        const el = document.getElementById('event-date');
        flatpickr(el, flatpickrConfig);
        applyDateMask(el);
    }

    function applyDateMask(input) {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, ''); // Numeros solamente
            if (v.length > 8) v = v.slice(0, 8); // Maximo 8 digitos

            if (v.length >= 5) {
                v = v.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
            } else if (v.length >= 3) {
                v = v.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
            }
            e.target.value = v;
        });

        // Opcional: Evitar que se escriban letras directamente
        input.addEventListener('keydown', (e) => {
            const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
            if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

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
                // Reset y Hide Filter Panel al salir
                const filterWrapper = document.getElementById('filter-reveal-wrapper');
                if (filterWrapper) {
                    filterWrapper.classList.remove('active');
                    btnFilter.classList.remove('active');
                    // Limpiar valores de los inputs
                    document.getElementById('filter-status').value = "";
                    document.getElementById('filter-name').value = "";
                    document.getElementById('filter-client-id').value = "";
                    document.getElementById('filter-date-from').value = "";
                    document.getElementById('filter-date-to').value = "";
                    // Restablecer la lista completa
                    activeReservations = [...dummyReservations];
                    renderReservations();
                }
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

    // Dummy Data for Checklist (Generando más datos para probar paginación)
    const baseReservations = [
        { estado: 'Pendiente', cliente: 'Ramiro Octavio', uso: 'Baby Shower', servicios: 'No' },
        { estado: 'Pendiente', cliente: 'Amanda Griselda', uso: 'Cumpleaños', servicios: 'Si' },
        { estado: 'Pendiente', cliente: 'Ricardo Sosa', uso: 'Cumpleaños', servicios: 'Si' },
        { estado: 'Pagado', cliente: 'Lucia Fernandez', uso: 'Boda', servicios: 'No' },
        { estado: 'Pendiente', cliente: 'Marcos Ruiz', uso: 'Cumpleaños', servicios: 'Si' },
        { estado: 'Pendiente', cliente: 'Elena Gomez', uso: 'Reunión', servicios: 'Si' },
        { estado: 'Pagado', cliente: 'Aquiles Garcia', uso: 'baile/joda', servicios: 'Si' }
    ];

    let dummyReservations = [];
    // Generar 65 reservaciones para tener al menos 4 páginas (20 por página)
    for (let i = 1; i <= 65; i++) {
        const base = baseReservations[i % baseReservations.length];
        dummyReservations.push({
            nro: i,
            estado: base.estado,
            cliente: `${base.cliente} ${i}`,
            fechaReserva: `10/${(i % 12) + 1}/2023`,
            uso: base.uso,
            fechaEvento: `15/${(i % 12) + 1}/2023`,
            servicios: base.servicios
        });
    }

    let activeReservations = [...dummyReservations];
    let currentSort = { field: null, direction: 'asc' };

    // Configuración de Paginación
    let currentPage = 1;
    const itemsPerPage = 20;

    function renderReservations(data = activeReservations, page = 1) {
        const list = document.getElementById('reservations-list');
        if (!list) return;
        list.innerHTML = '';

        // Lógica de Paginación: Recortar datos
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);

        paginatedData.forEach((res, index) => {
            const statusClass = res.estado === 'Pagado' ? 'status-paid' : 'status-pending';
            const item = document.createElement('div');
            item.className = 'reservation-item';
            item.style.animationDelay = `${index * 0.03}s`;

            // 1. Tarjeta Principal
            const card = document.createElement('div');
            card.className = 'reservation-card';
            card.innerHTML = `
                <div class="col-nro">${res.nro}</div>
                <div class="col-estado"><span class="status ${statusClass}">${res.estado}</span></div>
                <div class="col-cliente">${res.cliente}</div>
                <div class="col-fecha-reserva">${res.fechaReserva}</div>
                <div class="col-uso">${res.uso}</div>
                <div class="col-fecha-evento">${res.fechaEvento}</div>
                <div class="col-servicios">${res.servicios}</div>
                <div class="col-btn-cancel">
                    ${res.estado === 'Pendiente' ? '<button class="btn-cancel">Cancelar</button>' : ''}
                </div>
                <div class="col-btn-view">
                    <button class="btn-view action-view-details">Ver</button>
                </div>
                <div class="col-btn-more">
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

            // 2. Panel de Detalles (Oculto por defecto)
            const details = document.createElement('div');
            details.className = 'details-panel';
            details.innerHTML = `
                <div class="details-content">
                    <div class="details-grid">
                        <!-- Columna 1: Datos Cliente -->
                        <div class="detail-column">
                            <h4>Nro de Cliente: ${res.nro}</h4>
                            <p><strong>Nombre:</strong> ${res.cliente}</p>
                            <p><strong>Telefono:</strong> 3644556040</p>
                            <p><strong>DNI:</strong> 41111098</p>
                        </div>
                        
                        <!-- Columna 2: Descripción -->
                        <div class="detail-column">
                            <h4>Descripcion</h4>
                            <p>Texto prueba texto prueba texto prueba texto prueba texto prueba texto prueba texto prueba</p>
                        </div>

                        <!-- Columna 3: Fechas -->
                        <div class="detail-column">
                            <h4>Desde</h4>
                            <p>${res.fechaEvento}</p>
                            <h4>Hasta</h4>
                            <p>${res.fechaEvento}</p>
                        </div>

                        <!-- Columna 4: Servicio (Centrado) -->
                        <div class="detail-column center-content">
                            <h4>Servicio</h4>
                            <p style="margin-top: 10px; line-height: 1.6;">
                                ${res.uso === 'Baby Shower' ? 'Aire<br>Acondicionado<br>3hs' : 'Salón<br>completo<br>Full'}
                            </p>
                        </div>

                        <!-- Columna 5: Montos -->
                        <div class="detail-column">
                            <h4>Conceptos <span style="float:right;">Monto</span></h4>
                            <div class="amount-row">
                                <span>Alquiler:</span>
                                <span>$ 80.000,00</span>
                            </div>
                            <div class="amount-row">
                                <span>Servicios:</span>
                                <span>$ 6.500,00</span>
                            </div>
                            <div class="amount-row text-green">
                                <span>Total Pagado:</span>
                                <span>$ 20.000,00</span>
                            </div>
                            <div class="amount-row text-red">
                                <span>Deuda:</span>
                                <span>$ 66.500,00</span>
                            </div>
                            <div class="divider-line"></div>
                            <div class="amount-row">
                                <strong>Total:</strong>
                                <strong>$ 86.500,00</strong>
                            </div>
                            <button class="btn-ver-pagos">Ver Pagos</button>
                        </div>
                    </div>
                </div>
            `;

            // 3. Lógica de Toggle
            const btnView = card.querySelector('.action-view-details');
            btnView.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');

                // Cerrar todos los demás primero (Opcional, si quieres comportamiento de acordeón único)
                document.querySelectorAll('.reservation-card.expanded').forEach(c => {
                    if (c !== card) {
                        c.classList.remove('expanded');
                        c.nextElementSibling.classList.remove('open');
                    }
                });

                // Toggle actual
                card.classList.toggle('expanded');
                details.classList.toggle('open');
            });

            item.appendChild(card);
            item.appendChild(details);
            list.appendChild(item);
        });

        renderPagination(data.length, page);
    }

    function renderPagination(totalItems, currentPage) {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return;

        // Texto "Página"
        const label = document.createElement('span');
        label.textContent = 'Página';
        paginationContainer.appendChild(label);

        // Flecha Izquierda
        const btnPrev = document.createElement('span');
        btnPrev.className = 'pagination-arrow';
        btnPrev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        btnPrev.onclick = () => {
            if (currentPage > 1) renderReservations(activeReservations, currentPage - 1);
        };
        paginationContainer.appendChild(btnPrev);

        // Número Actual (Círculo)
        const currentIndicator = document.createElement('div');
        currentIndicator.className = 'page-current';
        currentIndicator.textContent = currentPage;
        paginationContainer.appendChild(currentIndicator);

        // Flecha Derecha
        const btnNext = document.createElement('span');
        btnNext.className = 'pagination-arrow';
        btnNext.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        btnNext.onclick = () => {
            if (currentPage < totalPages) renderReservations(activeReservations, currentPage + 1);
        };
        paginationContainer.appendChild(btnNext);

        // Dropdown personalizado a la derecha (Despliegue hacia arriba)
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'custom-pagination-dropdown';

        const dropdownTrigger = document.createElement('div');
        dropdownTrigger.className = 'pagination-trigger';
        dropdownTrigger.innerHTML = `${currentPage} <i class="fa-solid fa-chevron-up"></i>`;

        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'pagination-menu';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.textContent = i;
            if (i === currentPage) li.className = 'active';
            li.onclick = (e) => {
                e.stopPropagation();
                renderReservations(activeReservations, i);
            };
            dropdownMenu.appendChild(li);
        }

        dropdownTrigger.onclick = (e) => {
            e.stopPropagation();
            // Cerrar otros dropdowns si los hubiera
            document.querySelectorAll('.pagination-menu.show').forEach(m => {
                if (m !== dropdownMenu) m.classList.remove('show');
            });
            dropdownMenu.classList.toggle('show');
            dropdownTrigger.classList.toggle('open');
        };

        // Cerrar al hacer click fuera
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
            dropdownTrigger.classList.remove('open');
        });

        dropdownWrapper.appendChild(dropdownTrigger);
        dropdownWrapper.appendChild(dropdownMenu);
        paginationContainer.appendChild(dropdownWrapper);
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
                valA = parseDate(valA);
                valB = parseDate(valB);
            }

            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderReservations(activeReservations, currentPage);
    }

    // Header sort events
    document.querySelectorAll('.checklist-header [data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            sortReservations(header.dataset.sort);
        });
    });

    // Filter Panel logic
    const filterWrapper = document.getElementById('filter-reveal-wrapper');
    if (btnFilter && filterWrapper) {
        btnFilter.addEventListener('click', () => {
            filterWrapper.classList.toggle('active');
            btnFilter.classList.toggle('active');
        });
    }

    // Filter Date Pickers
    if (document.getElementById('filter-date-from')) {
        const el = document.getElementById('filter-date-from');
        flatpickr(el, flatpickrConfig);
        applyDateMask(el);
    }
    if (document.getElementById('filter-date-to')) {
        const el = document.getElementById('filter-date-to');
        flatpickr(el, flatpickrConfig);
        applyDateMask(el);
    }

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

            currentPage = 1; // Resetear a página 1 al filtrar
            renderReservations(activeReservations, currentPage);
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
