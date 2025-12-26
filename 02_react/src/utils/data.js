// data.js - Manejo de datos dummy y estructuras iniciales

const baseReservations = [
    { estado: 'Pendiente', cliente: 'Ramiro Octavio', uso: 'Baby Shower', servicios: 'No' },
    { estado: 'Pendiente', cliente: 'Amanda Griselda', uso: 'Cumpleaños', servicios: 'Si' },
    { estado: 'Pendiente', cliente: 'Ricardo Sosa', uso: 'Cumpleaños', servicios: 'Si' },
    { estado: 'Pagado', cliente: 'Lucia Fernandez', uso: 'Boda', servicios: 'No' },
    { estado: 'Pendiente', cliente: 'Marcos Ruiz', uso: 'Cumpleaños', servicios: 'Si' },
    { estado: 'Pendiente', cliente: 'Elena Gomez', uso: 'Reunión', servicios: 'Si' },
    { estado: 'Pagado', cliente: 'Aquiles Garcia', uso: 'baile/joda', servicios: 'Si' }
];

export function generateDummyData() {
    let data = [];
    // Generar 65 reservaciones para tener al menos 4 páginas (20 por página)
    for (let i = 1; i <= 65; i++) {
        const base = baseReservations[i % baseReservations.length];
        data.push({
            nro: i,
            estado: base.estado,
            cliente: `${base.cliente} ${i}`,
            fechaReserva: `10/${(i % 12) + 1}/2023`,
            uso: base.uso,
            fechaEvento: `15/${(i % 12) + 1}/2023`,
            servicios: base.servicios
        });
    }
    return data;
}
