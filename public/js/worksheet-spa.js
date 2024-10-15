document.addEventListener('DOMContentLoaded', initializePage);

let currentYear, currentMonth, currentEmployee;
let events = [];

function initializePage() {
    initializeFilters();
    fetchEmployees();
    addEventListeners();
}

function initializeFilters() {
    const currentDate = new Date();
    currentYear = currentDate.getFullYear();
    currentMonth = currentDate.getMonth();

    const yearFilter = document.getElementById('year-filter');
    const monthFilter = document.getElementById('month-filter');

    // Inicjalizacja lat (bieżący rok +/- 2 lata)
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
    yearFilter.value = currentYear;

    // Ustawiamy aktualny miesiąc
    monthFilter.value = (currentMonth + 1).toString().padStart(2, '0');
}

function fetchEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(employees => {
            const employeeFilter = document.getElementById('employee-filter');
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.enrollnumber;
                option.textContent = employee.nick;
                employeeFilter.appendChild(option);
            });
            if (employees.length > 0) {
                currentEmployee = employees[0].enrollnumber;
                employeeFilter.value = currentEmployee;
            }
            generateCalendar();
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function addEventListeners() {
    document.getElementById('year-filter').addEventListener('change', generateCalendar);
    document.getElementById('month-filter').addEventListener('change', generateCalendar);
    document.getElementById('employee-filter').addEventListener('change', generateCalendar);
}

function generateCalendar() {
    const year = parseInt(document.getElementById('year-filter').value);
    const month = parseInt(document.getElementById('month-filter').value) - 1;
    const employee = document.getElementById('employee-filter').value;

    fetchEvents(year, month, employee);
}

function fetchEvents(year, month, employee) {
    console.log(`Pobieranie wydarzeń dla pracownika: ${employee}, rok: ${year}, miesiąc: ${month + 1}`);
    fetch(`/api/worksheet/events?year=${year}&month=${month + 1}&enrollnumber=${employee}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Otrzymane dane:`, data);
            events = data;
            updateCalendar(year, month);
        })
        .catch(error => console.error('Error fetching events:', error));
}

function updateCalendar(year, month) {
    console.log('Otrzymane wydarzenia:', events);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarBody = document.querySelector('#calendar-table tbody');
    calendarBody.innerHTML = '';

    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

    // Sortujemy wydarzenia chronologicznie
    events.sort((a, b) => new Date(a.event_date + 'T' + a.event_time) - new Date(b.event_date + 'T' + b.event_time));

    let lastInEvent = null;
    let usedOutEvents = new Set();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const row = document.createElement('tr');

        // Data
        const dateCell = document.createElement('td');
        dateCell.textContent = `${day.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
        row.appendChild(dateCell);

        // Dzień tygodnia
        const dayNameCell = document.createElement('td');
        dayNameCell.textContent = dayNames[date.getDay()];
        row.appendChild(dayNameCell);

        // Numer czytnika (machinenumber)
        const machineNumberCell = document.createElement('td');
        row.appendChild(machineNumberCell);

        // Wejście i wyjście
        const inTimeCell = document.createElement('td');
        const outTimeCell = document.createElement('td');

        const dayEvents = events.filter(event => 
            new Date(event.event_date).getDate() === day &&
            new Date(event.event_date).getMonth() === month &&
            new Date(event.event_date).getFullYear() === year
        );

        console.log(`Wydarzenia dla ${day}.${month + 1}.${year}:`, dayEvents);

        if (dayEvents.length > 0 || lastInEvent) {
            let inEvent = lastInEvent || dayEvents.find(event => event.in_out === 2);
            let outEvent = dayEvents.find(event => event.in_out === 3 && !usedOutEvents.has(event.event_id));

            if (inEvent && !outEvent) {
                const nextDayEvents = events.filter(event => 
                    new Date(event.event_date).getDate() === day + 1 &&
                    new Date(event.event_date).getMonth() === month &&
                    new Date(event.event_date).getFullYear() === year
                );
                outEvent = nextDayEvents.find(event => event.in_out === 3 && !usedOutEvents.has(event.event_id));
            }

            console.log('Wydarzenie wejścia:', inEvent);
            console.log('Wydarzenie wyjścia:', outEvent);

            inTimeCell.textContent = inEvent ? formatTime(inEvent.event_time) : '';
            if (outEvent) {
                outTimeCell.textContent = formatTime(outEvent.event_time);
                usedOutEvents.add(outEvent.event_id);
            }

            // Ustawianie numeru czytnika
            if (inEvent && inEvent.machinenumber === 0) {
                machineNumberCell.textContent = '0';
            } else if (outEvent) {
                machineNumberCell.textContent = outEvent.machinenumber;
            } else if (inEvent) {
                machineNumberCell.textContent = inEvent.machinenumber;
            }

            if (inEvent && !outEvent) {
                lastInEvent = inEvent;
            } else {
                lastInEvent = null;
            }
        }

        row.appendChild(inTimeCell);
        row.appendChild(outTimeCell);

        calendarBody.appendChild(row);
    }
}

function formatTime(timeString) {
    console.log('Oryginalny czas:', timeString);
    return timeString.slice(0, 5);  // Zwracamy tylko godziny i minuty (HH:MM)
}