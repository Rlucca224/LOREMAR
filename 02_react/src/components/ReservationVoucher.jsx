import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Estilos del PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#333'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d97706', // Tu color accent
        textTransform: 'uppercase'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        textDecoration: 'underline'
    },
    section: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        marginTop: 20,
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
    },
    colDesc: { width: '60%' },
    colAmount: { width: '40%', textAlign: 'right' },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    totalLabel: { fontSize: 14, fontWeight: 'bold' },
    totalAmount: { fontSize: 14, fontWeight: 'bold', color: '#d97706' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 10,
        textAlign: 'center',
        color: '#999',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    }
});

// Componente del Documento PDF
const ReservationVoucher = ({ reservation }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Encabezado */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>LOREMAR</Text>
                        <Text style={{ fontSize: 10, color: '#666' }}>Salon de Eventos</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10 }}>Fecha de Emisión:</Text>
                        <Text>{new Date().toLocaleDateString('es-AR')}</Text>
                        <Text style={{ fontSize: 10, marginTop: 5 }}>Comprobante N°: {reservation.id}</Text>
                    </View>
                </View>

                <Text style={styles.title}>DETALLE DE RESERVA</Text>

                {/* Datos del Cliente y Evento */}
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ width: '50%' }}>
                        <View style={styles.section}>
                            <Text style={styles.label}>CLIENTE</Text>
                            <Text style={styles.value}>{reservation.clientName || 'Consumidor Final'}</Text>
                            <Text style={styles.label}>DNI / CUIT</Text>
                            <Text style={styles.value}>{reservation.clientDni || '-'}</Text>
                            <Text style={styles.label}>TELÉFONO</Text>
                            <Text style={styles.value}>{reservation.clientPhone || '-'}</Text>
                        </View>
                    </View>
                    <View style={{ width: '50%' }}>
                        <View style={styles.section}>
                            <Text style={styles.label}>TIPO DE EVENTO</Text>
                            <Text style={styles.value}>{reservation.eventType || '-'}</Text>
                            <Text style={styles.label}>FECHA DEL EVENTO</Text>
                            <Text style={styles.value}>{formatDate(reservation.eventDate)}</Text>
                            <Text style={styles.label}>NOTAS</Text>
                            <Text style={styles.value}>{reservation.description || 'Sin notas adicionales.'}</Text>
                        </View>
                    </View>
                </View>

                {/* Tabla de Costos */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.colDesc}>Concepto</Text>
                        <Text style={styles.colAmount}>Importe</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.colDesc}>Alquiler de Salón</Text>
                        <Text style={styles.colAmount}>{formatCurrency(reservation.rentalPrice)}</Text>
                    </View>

                    {reservation.hasAc && (
                        <View style={styles.tableRow}>
                            <Text style={styles.colDesc}>Aire Acondicionado ({reservation.acHours} hs)</Text>
                            <Text style={styles.colAmount}>{formatCurrency(reservation.acTotal)}</Text>
                        </View>
                    )}

                    <View style={[styles.tableRow, { backgroundColor: '#fffbeb' }]}>
                        <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>TOTAL PACTADO</Text>
                        <Text style={[styles.colAmount, { fontWeight: 'bold' }]}>
                            {formatCurrency(reservation.rentalPrice + (reservation.acTotal || 0))}
                        </Text>
                    </View>
                </View>

                {/* Estado de Pagos */}
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>ESTADO DE CUENTA</Text>
                    <View style={styles.row}>
                        <Text>Seña / Pagos Realizados:</Text>
                        <Text style={{ color: '#10b981', fontWeight: 'bold' }}>- {formatCurrency(reservation.deposit)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>SALDO PENDIENTE:</Text>
                        <Text style={[styles.totalAmount, { color: reservation.balance > 0 ? '#ef4444' : '#10b981' }]}>
                            {formatCurrency(reservation.balance)}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: reservation.balance <= 0 ? '#10b981' : '#666', marginTop: 5 }}>
                        {reservation.balance <= 0 ? '¡RESERVA COMPLETAMENTE PAGADA!' : 'Este saldo debe cancelarse antes de la fecha del evento.'}
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Gracias por confiar en LOREMAR Eventos - Tel: 11-1234-5678 - www.loremareventos.com
                </Text>
            </Page>
        </Document>
    );
};

export default ReservationVoucher;
