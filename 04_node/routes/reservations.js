/* 
   RUTAS DE RESERVAS (Backend API)
   Este archivo maneja todas las operaciones CRUD (Crear, Leer) relacionadas con las reservas.
   Se conecta a la base de datos PostgreSQL a través del cliente de Prisma.
*/

const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); // Importamos la instancia conectada de Prisma

// ==========================================
// 1. OBTENER TODAS LAS RESERVAS (GET /api/reservations)
// ==========================================
// Esta ruta es llamada por el frontend (ReservationList.jsx) para mostrar la lista.
// AHORA SOPORTA FILTROS (status, name, clientId, dateFrom, dateTo)
router.get('/', async (req, res) => {
    try {
        console.log("Solicitando lista de reservas con filtros:", req.query);

        const { status, name, clientId, dateFrom, dateTo } = req.query;

        // Construcción dinámica del filtro (Validación de filtros vacíos)
        let whereClause = {};

        // 1. Filtro por Estado (Exacto)
        if (status && status !== '') {
            whereClause.status = status;
        }

        // 2. Filtro por Nombre de Cliente (Parcial, Case Insensitive)
        if (name && name !== '') {
            whereClause.clientName = {
                contains: name,
                mode: 'insensitive' // Ignora mayúsculas/minúsculas en Postgres
            };
        }

        // 3. Filtro por ID de Reserva ("N° de cliente" en el UI se mapea a ID de reserva por el momento)
        if (clientId && clientId !== '') {
            const idNum = parseInt(clientId);
            if (!isNaN(idNum)) {
                whereClause.id = idNum;
            }
        }

        // 4. Filtro por Rango de Fechas (Fecha de RESERVA/CREACIÓN)
        // El frontend envía formato "dd/mm/yyyy". Necesitamos convertirlo a Date.
        if (dateFrom || dateTo) {
            whereClause.createdAt = {}; // Cambiado de eventDate a createdAt

            if (dateFrom) {
                const [day, month, year] = dateFrom.split('/');
                // Crear fecha al inicio del día (00:00:00)
                const fromDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
                whereClause.createdAt.gte = fromDate;
            }

            if (dateTo) {
                const [day, month, year] = dateTo.split('/');
                // Crear fecha al FINAL del día (23:59:59.999) para incluir todo ese día
                const toDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
                whereClause.createdAt.lte = toDate;
            }
        }

        console.log("Prisma Where Clause:", JSON.stringify(whereClause, null, 2));

        const reservations = await prisma.reservation.findMany({
            where: whereClause,
            // 'orderBy' es equivalente a "ORDER BY id DESC" (las más nuevas primero)
            orderBy: {
                id: 'desc'
            }
        });

        // Respondemos con el array de objetos JSON
        res.json(reservations);

    } catch (error) {
        console.error("Error crítico al obtener reservas:", error);
        // Retornamos 500 (Internal Server Error) para que el front sepa que falló
        res.status(500).json({ error: "No se pudieron cargar las reservas" });
    }
});

// ==========================================
// 2. CREAR NUEVA RESERVA (POST /api/reservations)
// ==========================================
// Esta ruta recibe los datos del formulario (NewReservation.jsx).
router.post('/', async (req, res) => {
    try {
        const data = req.body; // Aquí vienen los datos del formulario en JSON

        console.log("--- Procesando Nueva Reserva ---");
        console.log("Datos recibidos:", data);

        /* 
           PREPARACIÓN DE DATOS:
           Prisma es estricto con los tipos de datos (Int, Float, DateTime).
           Aunque el 'schema.prisma' define los tipos, desde el frontend todo llega via JSON.
           Es buena práctica asegurar la conversión aquí.
        */

        const newReservation = await prisma.reservation.create({
            data: {
                // Bloque 1: Datos Personales
                clientName: data.clientName,
                clientPhone: data.clientPhone,
                clientDni: data.clientDni, // String opcional

                // Bloque 2: Evento
                // Si no hay fecha, usamos la fecha actual en lugar de 1970
                eventDate: data.eventDate ? new Date(data.eventDate) : new Date(),
                eventType: data.eventType,
                description: data.description,

                // Bloque 3: Servicios (Aire Acondicionado)
                hasAc: data.hasAc, // true/false
                // ParseInt para horas, ParseFloat para precios. '|| 0' evita romper si viene null.
                acHours: parseInt(data.acHours || 0),
                acPricePerHour: parseFloat(data.acPricePerHour || 0),
                // Calculamos el total de AC aquí para asegurar consistencia
                acTotal: (parseInt(data.acHours || 0) * parseFloat(data.acPricePerHour || 0)),

                // Bloque 4: Finanzas
                rentalPrice: parseFloat(data.rentalPrice || 0),
                deposit: parseFloat(data.deposit || 0),

                // BALANCE: Corazón del negocio. 
                // Redondeamos a 2 decimales para evitar errores de punto flotante (ej: 0.00000000001)
                balance: parseFloat(((parseFloat(data.rentalPrice || 0) + (parseInt(data.acHours || 0) * parseFloat(data.acPricePerHour || 0))) - parseFloat(data.deposit || 0)).toFixed(2)),

                // ESTADO AUTOMÁTICO:
                // Usamos el mismo cálculo redondeado para la condición
                status: parseFloat(((parseFloat(data.rentalPrice || 0) + (parseInt(data.acHours || 0) * parseFloat(data.acPricePerHour || 0))) - parseFloat(data.deposit || 0)).toFixed(2)) <= 0 ? 'Pagado' : 'Pendiente'
            }
        });

        console.log("✅ Reserva guardada con ID:", newReservation.id);

        // Devolvemos el objeto creado. El frontend lo usa para confirmar o redirigir.
        res.json(newReservation);

    } catch (error) {
        console.error("❌ Error al guardar en base de datos:", error);
        res.status(500).json({ error: "Error al crear la reserva en base de datos" });
    }
});

// ==========================================
// 3. ELIMINAR RESERVA (DELETE /api/reservations/:id)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Eliminando reserva ID: ${id}`);

        await prisma.reservation.delete({
            where: { id: Number(id) }
        });

        console.log(`✅ Reserva ID ${id} eliminada correctamente.`);
        res.json({ message: "Reserva eliminada correctamente" });

    } catch (error) {
        // Error P2025: Record to delete does not exist.
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }
        console.error("❌ Error al eliminar reserva:", error);
        res.status(500).json({ error: "Error al eliminar la reserva" });
    }
});

module.exports = router;