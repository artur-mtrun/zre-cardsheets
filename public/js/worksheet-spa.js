let employees = [];
let events = [];

document.addEventListener('DOMContentLoaded', () => {
    const monthFilter = document.getElementById('monthFilter');
    const yearFilter = document.getElementById('yearFilter');
    const employeeFilter = document.getElementById('employeeFilter');
    const worksheetTable = document.getElementById('worksheetTable').getElementsByTagName('tbody')[0];

    function populateYearFilter() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    }

    function initializeFilters() {
        const currentDate = new Date();
        monthFilter.value = currentDate.getMonth();
        yearFilter.value = currentDate.getFullYear();
        
        console.log('Filters initialized:', { month: monthFilter.value, year: yearFilter.value });
    }

    function updateCalendar() {
        const selectedYear = parseInt(yearFilter.value);
        const selectedMonth = parseInt(monthFilter.value);
        const selectedEmployee = employeeFilter.value;
        console.log('Updating calendar for:', { year: selectedYear, month: selectedMonth, employee: selectedEmployee });
        fetchEvents(selectedYear, selectedMonth, selectedEmployee);
    }

    function fetchEmployees() {
        fetch('/api/worksheet/employees')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                populateEmployeeFilter(data);
                if (data.length > 0) {
                    employeeFilter.value = data[0].enrollnumber;
                    updateCalendar(); // Wywołaj updateCalendar po ustawieniu pierwszego pracownika
                }
            })
            .catch(error => {
                console.error('Error fetching employees:', error);
                alert('Wystąpił błąd podczas pobierania pracowników. Spróbuj ponownie później.'); // Dodany alert
            });
    }

    function populateEmployeeFilter(employees) {
        employeeFilter.innerHTML = ''; // Wyczyść istniejące opcje
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.enrollnumber;
            option.textContent = `${employee.nick} (${employee.enrollnumber})`;
            employeeFilter.appendChild(option);
        });
    }

    function fetchEvents(year, month, enrollnumber) {
        console.log(`Fetching data for ${year}-${month + 1}, employee: ${enrollnumber}`);
        let eventsUrl = `/api/worksheet/events?year=${year}&month=${month + 1}&enrollnumber=${enrollnumber}`;
        let worksheetUrl = `/api/worksheet/data?year=${year}&month=${month + 1}&enrollnumber=${enrollnumber}`;
        
        Promise.all([
            fetch(eventsUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }),
            fetch(worksheetUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        ])
        .then(([eventsData, worksheetData]) => {
            console.log('Fetched events data:', eventsData);
            console.log('Fetched worksheet data:', worksheetData);
            generateCalendar(year, month, eventsData, worksheetData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Wystąpił błąd podczas pobierania danych. Spróbuj ponownie później.');
        });
    }

    function generateCalendar(year, month, events, worksheetData) {
        console.log('Generating calendar for:', year, month);
        console.log('Events data:', events);
        console.log('Worksheet data:', worksheetData);

        worksheetTable.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

        const headerRow = worksheetTable.insertRow();
        ['Data', 'Dzień tygodnia', 'Nr czytnika', 'Wejście', 'Wyjście', 'Suma czasu'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        let totalMonthTime = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const row = worksheetTable.insertRow();
            row.classList.add('event-row');

            // Data
            const dateCell = row.insertCell();
            dateCell.textContent = `${day} ${getMonthName(month)} ${year}`;

            // Dzień tygodnia
            const dayCell = row.insertCell();
            dayCell.textContent = dayNames[date.getDay()];

            // Nr czytnika
            const machineNumberCell = row.insertCell();

            // Wejście
            const inCell = row.insertCell();
            // Wyjście
            const outCell = row.insertCell();
            // Suma czasu
            const sumCell = row.insertCell();

            // Znajdź wydarzenia dla tego dnia
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.event_date);
                return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
            });

            let inTimes = [], outTimes = [], machineNumbers = [];

            // Zbierz wszystkie wejścia i wyjścia
            dayEvents.forEach(event => {
                if (event.in_out === 2) { // Wejście
                    inTimes.push(event.event_time);
                    machineNumbers.push(event.machinenumber);
                } else if (event.in_out === 3) { // Wyjście
                    outTimes.push(event.event_time);
                }
            });

            console.log('In times for day:', day, 'Times:', inTimes);
            console.log('Out times for day:', day, 'Times:', outTimes);

            // Wypełnij komórki wejścia, wyjścia i nr czytnika
            inCell.textContent = inTimes.join(', ');
            outCell.textContent = outTimes.join(', ');
            machineNumberCell.textContent = [...new Set(machineNumbers)].join(', ') || '0';

            // Dodaj wiersz z danymi z worksheet
            const worksheetRow = worksheetTable.insertRow();
            const dayWorksheetData = worksheetData.find(ws => {
                const wsDate = new Date(ws.event_date);
                //wsDate.setHours(0, 0, 0, 0); // Ustaw godziny na zero
                const isSameDate = wsDate.getDate() === day && wsDate.getMonth() === month && wsDate.getFullYear() === year;
                console.log('Sprawdzanie daty:', wsDate, 'Dopasowanie:', isSameDate); // Dodany log
                return isSameDate;
            });

            console.log('Processing day:', day);
            console.log('Day worksheet data:', dayWorksheetData);

            if (dayWorksheetData) {
                worksheetRow.insertCell().textContent = 'Wpis';
                
                const changeButton = document.createElement('button');
                changeButton.textContent = 'Zmień';
                changeButton.classList.add('btn', 'btn-secondary', 'btn-sm');
                changeButton.onclick = () => editWorksheetEntry(dayWorksheetData.worksheet_id, day, month, year);
                const buttonCell = worksheetRow.insertCell();
                buttonCell.appendChild(changeButton);
                
                worksheetRow.insertCell().textContent = dayWorksheetData.machinenumber || '0';
                
                const inTimeInput = document.createElement('input');
                inTimeInput.type = 'time';
                inTimeInput.value = dayWorksheetData.in_time || '';
                worksheetRow.insertCell().appendChild(inTimeInput);
                
                const outTimeInput = document.createElement('input');
                outTimeInput.type = 'time';
                outTimeInput.value = dayWorksheetData.out_time || '';
                worksheetRow.insertCell().appendChild(outTimeInput);
                
                const worksheetSumCell = worksheetRow.insertCell();

                // Oblicz sumę czasu dla wpisu worksheet
                if (dayWorksheetData.in_time && dayWorksheetData.out_time) {
                    const timeDiff = calculateTimeDifference(dayWorksheetData.in_time, dayWorksheetData.out_time);
                    const hours = Math.floor(timeDiff / 60);
                    const minutes = timeDiff % 60;
                    worksheetSumCell.textContent = `${hours}h ${minutes}m`;
                    totalMonthTime += timeDiff;
                }

                // Kolorowanie wiersza
                const machineNumber = parseInt(dayWorksheetData.machinenumber);
                if (machineNumber === 0) {
                    worksheetRow.classList.add('worksheet-row-yellow');
                } else if (machineNumber > 0) {
                    worksheetRow.classList.add('worksheet-row-green');
                }

                console.log('Worksheet data:', dayWorksheetData);
                console.log('Machine number:', dayWorksheetData ? dayWorksheetData.machinenumber : 'No data');
                console.log('Applied class:', worksheetRow.className);
            } else {
                worksheetRow.insertCell().textContent = 'Brak wpisu';
                
                const addButton = document.createElement('button');
                addButton.textContent = 'Dodaj';
                addButton.classList.add('btn', 'btn-primary', 'btn-sm');
                addButton.onclick = () => addWorksheetEntry(day, machineNumbers[0] || '0');
                const buttonCell = worksheetRow.insertCell();
                buttonCell.appendChild(addButton);
                
                worksheetRow.insertCell().textContent = machineNumbers[0] || '0';
                
                const inTimeInput = document.createElement('input');
                inTimeInput.type = 'time';
                inTimeInput.value = inTimes[0] || '';
                worksheetRow.insertCell().appendChild(inTimeInput);
                
                const outTimeInput = document.createElement('input');
                outTimeInput.type = 'time';
                outTimeInput.value = outTimes[outTimes.length - 1] || '';
                worksheetRow.insertCell().appendChild(outTimeInput);
                
                worksheetRow.insertCell(); // Pusta komórka dla sumy czasu

                // Kolorowanie wiersza na jasnoczerwono
                worksheetRow.classList.add('worksheet-row-red');
            }

            console.log('Added class:', worksheetRow.className);
            console.log('Computed style:', window.getComputedStyle(worksheetRow).backgroundColor);

            // Stylizacja wiersza worksheet
            Array.from(worksheetRow.cells).forEach(cell => {
                cell.style.fontStyle = 'italic';
            });
        }

        // Dodaj wiersz z sumą czasu dla całego miesiąca
        const totalRow = worksheetTable.insertRow();
        totalRow.insertCell().textContent = 'Suma dla miesiąca';
        totalRow.insertCell(); // Pusty dla dnia tygodnia
        totalRow.insertCell(); // Pusty dla nr czytnika
        totalRow.insertCell(); // Pusty dla wejścia
        totalRow.insertCell(); // Pusty dla wyjścia
        const totalMonthCell = totalRow.insertCell();
        const totalHours = Math.floor(totalMonthTime / 60);
        const totalMinutes = totalMonthTime % 60;
        totalMonthCell.textContent = `${totalHours}h ${totalMinutes}m`;
        totalMonthCell.style.fontWeight = 'bold';
    }

    function calculateTimeDifference(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        let diffMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Jeśli różnica jest ujemna, zakładamy, że wyjście było następnego dnia
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60;
        }
        
        return diffMinutes;
    }

    // Globalne zmienne
    let selectedYear, selectedMonth, selectedEnrollNumber;

    // Funkcja do uzyskiwania nazwy miesiąca
    function getMonthName(monthIndex) {
        const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
        return monthNames[monthIndex];
    }

    // Funkcja do aktualizacji wybranych wartości
    function updateSelectedValues() {
        selectedYear = document.getElementById('yearFilter').value;
        selectedMonth = document.getElementById('monthFilter').value;
        selectedEnrollNumber = document.getElementById('employeeFilter').value;
    }

    function addWorksheetEntry(day, machineNumber) {
        updateSelectedValues();
        const selectedMonthName = getMonthName(parseInt(selectedMonth));

        const rows = worksheetTable.rows;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[0].textContent.startsWith(`${day} ${selectedMonthName}`)) {
                const worksheetRow = rows[i + 1];
                const inTimeInput = worksheetRow.cells[3].querySelector('input');
                const outTimeInput = worksheetRow.cells[4].querySelector('input');
                
                console.log(`Dodawanie wpisu dla ${day}-${parseInt(selectedMonth) + 1}-${selectedYear}, pracownik: ${selectedEnrollNumber}, czytnik: ${machineNumber}: ${inTimeInput.value} - ${outTimeInput.value}`);
                
                fetch('/api/worksheet/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        day: day,
                        month: parseInt(selectedMonth) + 1,
                        year: selectedYear,
                        enrollnumber: selectedEnrollNumber,
                        machinenumber: machineNumber || '0', // Dodajemy '0' jako wartość domyślną
                        in_time: inTimeInput.value,
                        out_time: outTimeInput.value
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Wpis dodany:', data);
                    updateCalendar();
                })
                .catch((error) => {
                    console.error('Błąd podczas dodawania wpisu:', error);
                    alert(`Wystąpił błąd podczas dodawania wpisu: ${error.message || JSON.stringify(error)}`);
                });

                break;
            }
        }
    }

    function editWorksheetEntry(id, day, month, year) {
        console.log(`Próba edycji wpisu o ID: ${id}`);
        if (!id) {
            console.error('Brak ID wpisu do edycji');
            alert('Nie można edytować wpisu: brak identyfikatora');
            return;
        }

        updateSelectedValues();
        const selectedMonthName = getMonthName(parseInt(selectedMonth));

        const rows = worksheetTable.rows;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[0].textContent.startsWith(`${day} ${selectedMonthName}`)) {
                const worksheetRow = rows[i + 1];
                const machineNumber = worksheetRow.cells[2].textContent;
                const inTimeInput = worksheetRow.cells[3].querySelector('input');
                const outTimeInput = worksheetRow.cells[4].querySelector('input');
                
                console.log(`Edycja wpisu ${id} dla ${day}-${parseInt(selectedMonth) + 1}-${selectedYear}, pracownik: ${selectedEnrollNumber}, czytnik: ${machineNumber}: ${inTimeInput.value} - ${outTimeInput.value}`);
                
                // Zmiana ścieżki URL z /worksheet/edit/${id} na /worksheet/edit-entry/${id}
                fetch(`api/worksheet/edit-entry/${id}`, {
                    method: 'POST', // Zmiana metody z PUT na POST
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        day: day,
                        month: parseInt(selectedMonth) + 1,
                        year: selectedYear,
                        enrollnumber: selectedEnrollNumber,
                        machinenumber: machineNumber,
                        in_time: inTimeInput.value,
                        out_time: outTimeInput.value
                    })
                })
                .then(response => {
                    console.log('Status odpowiedzi:', response.status);
                    console.log('Typ zawartości:', response.headers.get('content-type'));
                    if (!response.ok) {
                        return response.text().then(text => {
                            console.error('Odpowiedź serwera:', text);
                            throw new Error(`HTTP error! status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Wpis zaktualizowany:', data);
                    updateCalendar();
                })
                .catch((error) => {
                    console.error('Błąd podczas edycji wpisu:', error);
                    alert(`Wystąpił błąd podczas edycji wpisu: ${error.message}`);
                });

                break;
            }
        }
    }

    populateYearFilter();
    initializeFilters();
    fetchEmployees();

    monthFilter.addEventListener('change', updateCalendar);
    yearFilter.addEventListener('change', updateCalendar);
    employeeFilter.addEventListener('change', updateCalendar);
});