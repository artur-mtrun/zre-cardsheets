document.addEventListener('DOMContentLoaded', function() {
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');
    const employeeFilter = document.getElementById('employee-filter');
    const applyFiltersButton = document.getElementById('apply-filters');

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
            })
            .catch(error => console.error('Error fetching employees:', error));
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

    // Inicjalizacja
    initializeYearFilter();
    populateEmployeeFilter();
});

function renderEventsTable(events) {
    const tableBody = document.getElementById('events-list');
    tableBody.innerHTML = '';

    if (events.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">Brak danych do wyświetlenia</td></tr>';
        return;
    }

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${event.machinenumber}</td>
            <td>${event.enrollnumber}</td>
            <td>${event.nick || 'Unknown'}</td>
            <td>${event.in_out === 2 ? 'We' : 'Wy'}</td>
            <td>${new Date(event.event_date).toLocaleDateString()}</td>
            <td>${event.event_time}</td>
            <td>${calculateWorkTime(event)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function calculateWorkTime(event) {
    // Tutaj możesz dodać logikę obliczania czasu pracy
    // Na razie zwracamy pusty string
    return '';
}

function fetchFilteredEvents(year, month, enrollnumber) {
    console.log('Fetching events:', year, month, enrollnumber);
    fetch(`/api/events/filter?year=${year}&month=${month}&enrollnumber=${enrollnumber}`)
        .then(response => response.json())
        .then(events => {
            console.log('Received events:', events);
            renderEventsTable(events);
        })
        .catch(error => console.error('Error fetching filtered events:', error));
}
