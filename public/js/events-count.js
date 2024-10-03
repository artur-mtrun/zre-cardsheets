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

        // Tutaj możesz dodać kod do pobierania i wyświetlania przefiltrowanych danych
    });

    // Inicjalizacja
    initializeYearFilter();
    populateEmployeeFilter();
});
