import { addAppointment, deleteAppointment, listAppointments, listServices } from './booking-db.js';

const form = document.querySelector('#booking-form');
const fields = form.querySelector('fieldset');
const submit = form.querySelector('[type="submit"]');
const formStatus = document.querySelector('#booking-status');
const list = document.querySelector('#appointments');
const listStatus = document.querySelector('#appointments-status');
const services = new Map();
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });

function localDateTime() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
    const time = [pad(now.getHours()), pad(now.getMinutes())].join(':');
    return `${date}T${time}`;
}

function makeAppointmentItem(appointment) {
    const item = document.createElement('li');
    item.className = 'booking-item';
    item.id = `appointment-${appointment.id}`;
    const title = document.createElement('h3');
    title.textContent = `№ ${appointment.id} · ${services.get(appointment.serviceId)}`;
    const when = document.createElement('p');
    when.textContent = `${dateFormat.format(new Date(appointment.date + 'T12:00:00'))}, ${appointment.time}`;
    const customer = document.createElement('p');
    customer.textContent = `${appointment.customerName} · ${appointment.vehicle}`;
    item.append(title, when, customer);
    if (appointment.note) {
        const note = document.createElement('p');
        note.textContent = appointment.note;
        item.append(note);
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-outline-dark btn-sm mt-2';
    remove.textContent = `Удалить заявку № ${appointment.id}`;
    remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
            await deleteAppointment(appointment.id);
            const visibleItem = document.getElementById(item.id);
            const next = visibleItem?.nextElementSibling ?? visibleItem?.previousElementSibling;
            visibleItem?.remove();
            listStatus.textContent = `Заявка № ${appointment.id} удалена.`;
            (next?.querySelector('button') ?? listStatus).focus();
        } catch {
            listStatus.textContent = 'Не удалось удалить заявку. Попробуйте ещё раз.';
            remove.disabled = false;
        }
    });
    item.append(remove);
    return item;
}

async function refreshAppointments() {
    try {
        const appointments = await listAppointments();
        list.replaceChildren(...appointments.map(makeAppointmentItem));
        listStatus.textContent = appointments.length ? '' : 'Пока нет сохранённых заявок.';
    } catch {
        listStatus.textContent = 'Не удалось загрузить заявки. Обновите страницу.';
    }
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const customerName = data.customerName.trim();
    const vehicle = data.vehicle.trim();
    const now = localDateTime();
    form.elements.date.min = now.slice(0, 10);
    if (!customerName || !vehicle || !services.has(data.serviceId)) {
        formStatus.textContent = 'Укажите имя, автомобиль и услугу.';
        return;
    }
    if (`${data.date}T${data.time}` <= now) {
        formStatus.textContent = 'Выберите время в будущем.';
        return;
    }

    submit.disabled = true;
    formStatus.textContent = 'Сохраняем заявку…';
    try {
        const id = await addAppointment({
            serviceId: data.serviceId,
            customerName,
            vehicle,
            date: data.date,
            time: data.time,
            note: data.note.trim(),
        });
        form.reset();
        formStatus.textContent = `Заявка № ${id} сохранена в этом браузере.`;
        await refreshAppointments();
    } catch (error) {
        formStatus.textContent = error?.name === 'ConstraintError'
            ? 'На эту дату и время уже есть заявка. Выберите другое время.'
            : 'Не удалось сохранить заявку. Попробуйте ещё раз.';
    } finally {
        submit.disabled = false;
    }
});

async function init() {
    try {
        const catalog = await listServices();
        catalog.sort((left, right) => left.name.localeCompare(right.name, 'ru'));
        for (const service of catalog) {
            services.set(service.id, service.name);
            form.elements.serviceId.add(new Option(service.name, service.id));
        }
        form.elements.date.min = localDateTime().slice(0, 10);
        fields.disabled = false;
        await refreshAppointments();
    } catch {
        formStatus.textContent = 'База данных недоступна. Разрешите хранение данных сайта в браузере и обновите страницу.';
        listStatus.textContent = 'Заявки недоступны.';
    }
}

init();
