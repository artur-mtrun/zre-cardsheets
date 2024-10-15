let yearFilter, monthFilter, employeeFilter;

document.addEventListener('DOMContentLoaded', function() {
    yearFilter = document.getElementById('year-filter');
    monthFilter = document.getElementById('month-filter');
    employeeFilter = document.getElementById('employee-filter');
    const applyFiltersButton = document.getElementById('apply-filters');
    const eventEnrollnumber = document.getElementById('event-enrollnumber');
    const eventForm = document.getElementById('event-form');
    const eventMachinenumber = document.getElementById('event-machinenumber');
    const eventInOut = document.getElementById('event-in-out');
    const eventDate = document.getElementById('event-date');
    const eventTime = document.getElementById('event-time');

    // Inicjalizacja filtra roku
    function initializeYearFilter() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
        
        yearFilter.value = currentYear;
    }

    // Pobieranie pracowników i wypełnianie filtra
    function populateEmployeeFilter() {
        fetch('/api/employees')
            .then(response => response.json())
            .then(employees => {
                employeeFilter.innerHTML = ''; // Usuwamy opcję "Wszyscy pracownicy"
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.enrollnumber;
                    option.textContent = employee.nick;
                    employeeFilter.appendChild(option);
                });

                // Ustaw domyślnie pierwszego pracownika, jeśli lista nie jest pusta
                if (employees.length > 0) {
                    employeeFilter.value = employees[0].enrollnumber;
                }
                
                // Aktualizuj numer pracownika w formularzu
                initializeEmployeeNumber();
            })
            .catch(error => console.error('Error fetching employees:', error));
    }

    // Aktualizacja numeru pracownika w formularzu przy zmianie filtra
    employeeFilter.addEventListener('change', function() {
        eventEnrollnumber.value = this.value;
    });

    // Inicjalizacja numeru pracownika w formularzu
    function initializeEmployeeNumber() {
        if (employeeFilter.options.length > 0) {
            eventEnrollnumber.value = employeeFilter.value;
        }
    }

    // Obsługa przycisku "Zastosuj filtry"
    applyFiltersButton.addEventListener('click', function() {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;
        const selectedEmployee = employeeFilter.value;

        console.log('Wybrane filtry:', {
            month: selectedMonth,
            year: selectedYear,
            employee: selectedEmployee
        });

        fetchFilteredEvents(selectedYear, selectedMonth, selectedEmployee);
    });

    // Obsługa formularza dodawania zdarzenia
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newEvent = {
            machinenumber: eventMachinenumber.value,
            enrollnumber: eventEnrollnumber.value,
            in_out: eventInOut.value,
            event_date: eventDate.value,
            event_time: eventTime.value
        };

        fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Zdarzenie dodane:', data);
            // Odśwież listę zdarzeń
            fetchFilteredEvents(yearFilter.value, monthFilter.value, employeeFilter.value);
            // Wyczyść formularz
            eventForm.reset();
            // Przywróć domyślne wartości dla czytnika i numeru pracownika
            eventMachinenumber.value = '0';
            eventEnrollnumber.value = employeeFilter.value;
        })
        .catch(error => console.error('Błąd podczas dodawania zdarzenia:', error));
    });

    // Inicjalizacja
    initializeYearFilter();
    populateEmployeeFilter();
});

function renderEventsTable(events) {
    const tableBody = document.getElementById('events-list');
    tableBody.innerHTML = '';

    if (events.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">Brak danych do wyświetlenia</td></tr>';
        return;
    }

    let totalWorkTime = 0;

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        const previousEvent = events[index - 1] ? events[index - 1] : null;
        const workTime = previousEvent ? calculateWorkTime(event, previousEvent) : '';
        
        console.log(`Czas pracy dla zdarzenia ${index + 1}:`, workTime);
        
        if (workTime && workTime !== '') {
            const seconds = convertTimeToSeconds(workTime);
            console.log(`Czas w sekundach:`, seconds);
            if (!isNaN(seconds)) {
                totalWorkTime += seconds;
            } else {
                console.error(`Nieprawidłowy czas w sekundach dla zdarzenia ${index + 1}:`, seconds);
            }
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${event.machinenumber}</td>
            <td>${event.enrollnumber}</td>
            <td>${event.nick || 'Unknown'}</td>
            <td>${event.in_out === 2 ? 'We' : 'Wy'}</td>
            <td>${new Date(event.event_date).toLocaleDateString()}</td>
            <td>${event.event_time}</td>
            <td>${workTime}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-event" data-event-id="${event.event_id}">Usuń zdarzenie</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    console.log('Całkowity czas pracy w sekundach:', totalWorkTime);

    // Dodaj wiersz z sumą godzin
    const totalRow = document.createElement('tr');
    const formattedTotalTime = formatSeconds(totalWorkTime);
    console.log('Sformatowany całkowity czas:', formattedTotalTime);
    
    totalRow.innerHTML = `
        <td colspan="8" style="text-align: right;"><strong>Suma godzin:</strong></td>
        <td><strong>${formattedTotalTime}</strong></td>
    `;
    tableBody.appendChild(totalRow);

    // Dodaj nasłuchiwacze zdarzeń dla przycisków usuwania
    addDeleteEventListeners();
}

function addDeleteEventListeners() {
    console.log('Adding delete event listeners');
    const deleteButtons = document.querySelectorAll('.delete-event');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            if (confirm('Czy na pewno chcesz usunąć to zdarzenie?')) {
                deleteEvent(eventId);
            }
        });
    });
}

function deleteEvent(eventId) {
    console.log('Deleting event with ID:', eventId);
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Zdarzenie usunięte:', data);
        // Odśwież listę zdarzeń
        fetchFilteredEvents();
    })
    .catch(error => console.error('Błąd podczas usuwania zdarzenia:', error));
}

function calculateWorkTime(event, previousEvent) {
    if (event.in_out === 3 && previousEvent && previousEvent.in_out === 2) {
        console.log('Event:', event);
        console.log('Previous event:', previousEvent);
        
        const eventDateTime = new Date(event.event_date.split('T')[0] + 'T' + event.event_time);
        const previousEventDateTime = new Date(previousEvent.event_date.split('T')[0] + 'T' + previousEvent.event_time);
        
        console.log('Event date time:', eventDateTime);
        console.log('Previous event date time:', previousEventDateTime);
        
        if (isNaN(eventDateTime.getTime()) || isNaN(previousEventDateTime.getTime())) {
            console.error('Nieprawidłowy format daty lub czasu');
            return ''; // Zwracamy pusty string zamiast '---'
        }
        
        const workTime = eventDateTime.getTime() - previousEventDateTime.getTime();
        console.log('Work time in milliseconds:', workTime);
        
        const hours = Math.floor(workTime / (1000 * 60 * 60));
        const minutes = Math.floor((workTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((workTime % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return ''; // Zwracamy pusty string zamiast '---'
}

function fetchFilteredEvents() {
    const year = yearFilter ? yearFilter.value : new Date().getFullYear();
    const month = monthFilter ? monthFilter.value : (new Date().getMonth() + 1).toString().padStart(2, '0');
    const enrollnumber = employeeFilter ? employeeFilter.value : '';

    console.log('Fetching events:', year, month, enrollnumber);
    fetch(`/api/events/filter?year=${year}&month=${month}&enrollnumber=${enrollnumber}`)
        .then(response => response.json())
        .then(events => {
            console.log('Received events:', events);
            renderEventsTable(events);
        })
        .catch(error => console.error('Error fetching filtered events:', error));
}

function convertTimeToSeconds(timeString) {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function formatSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
