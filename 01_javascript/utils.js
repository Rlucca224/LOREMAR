// utils.js - Funciones de utilidad y formateo

export function parseDate(dateStr) {
    if (!dateStr) return null;
    const separator = dateStr.includes('-') ? '-' : '/';
    const parts = dateStr.split(separator).map(Number);
    // Asumiendo formato DD/MM/YYYY
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

export function applyDateMask(input) {
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
