const databaseName = 'avtoservis-booking';
const catalog = [
    { id: 'oil', name: 'Замена масла' },
    { id: 'tires', name: 'Замена шин' },
    { id: 'battery', name: 'Замена аккумулятора' },
    { id: 'engine', name: 'Ремонт двигателя' },
    { id: 'tow', name: 'Эвакуатор' },
    { id: 'maintenance', name: 'Техническое обслуживание' },
];

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            const services = db.createObjectStore('services', { keyPath: 'id' });
            for (const service of catalog) {
                services.add(service);
            }
            const appointments = db.createObjectStore('appointments', {
                keyPath: 'id',
                autoIncrement: true,
            });
            appointments.createIndex('bySlot', ['date', 'time'], { unique: true });
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function runRequest(storeName, mode, enqueue) {
    const db = await openDatabase();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const request = enqueue(transaction.objectStore(storeName));
            transaction.oncomplete = () => resolve(request.result);
            transaction.onabort = () => reject(transaction.error ?? request.error);
        });
    } finally {
        db.close();
    }
}

export function listServices() {
    return runRequest('services', 'readonly', store => store.getAll());
}

export function addAppointment(appointment) {
    return runRequest('appointments', 'readwrite', store => store.add(appointment));
}

export function listAppointments() {
    return runRequest('appointments', 'readonly', store => store.index('bySlot').getAll());
}

export function deleteAppointment(id) {
    return runRequest('appointments', 'readwrite', store => store.delete(id));
}
