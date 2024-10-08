document.addEventListener('DOMContentLoaded', () => {
  const eventsList = document.getElementById('events-list');
  const eventForm = document.getElementById('event-form');
  const monthFilter = document.getElementById('month-filter');
  const yearFilter = document.getElementById('year-filter');
  const employeeFilter = document.getElementById('employee-filter');
  const applyFiltersBtn = document.getElementById('apply-filters');

  let allEvents = []; // Przechowuje wszystkie zdarzenia

  function initializeFilters() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() zwraca 0-11

    // Wypełnij filtr roku
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    }
    yearFilter.value = currentYear;

    // Ustaw domyślny miesiąc
    monthFilter.value = currentMonth;
  }

  function fetchEvents() {
    fetch('/api/events')
      .then(response => {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(events => {
        allEvents = events; // Zapisz wszystkie zdarzenia
        populateEmployeeFilter(events);
        applyFilters(); // Zastosuj filtry po załadowaniu wydarzeń
      })
      .catch(error => console.error('Error:', error));
  }

  function renderEvents(events) {
    console.log('Przed sortowaniem:', events);
    
    // Sortowanie wydarzeń po dacie i czasie od najstarszych do najnowszych
    events.sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return dateA - dateB || a.event_time.localeCompare(b.event_time);
    });

    console.log('Po sortowaniu:', events);

    let totalWorkTime = 0;
    let lastInTime = null;

    // Renderowanie tabeli z pełnymi danymi wydarzeń
    eventsList.innerHTML = events.map((event, index) => {
      let workTime = '';
      if (event.in_out === 3 && lastInTime) { // Wyjście
        const inTime = new Date(`2000-01-01T${lastInTime}`);
        const outTime = new Date(`2000-01-01T${event.event_time}`);
        const diff = (outTime - inTime) / (1000 * 60 * 60); // różnica w godzinach
        workTime = diff.toFixed(2);
        totalWorkTime += parseFloat(workTime);
        lastInTime = null;
      } else if (event.in_out === 2) { // Wejście
        lastInTime = event.event_time;
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${event.machinenumber}</td>
          <td>${event.enrollnumber}</td>
          <td>${event.nick || 'N/A'}</td>
          <td><span class="badge bg-${event.in_out === 2 ? 'success' : 'danger'}">${event.in_out === 2 ? 'We' : 'Wy'}</span></td>
          <td>${event.event_date.split('T')[0]}</td>
          <td>${event.event_time}</td>
          <td>${workTime}</td>
          ${isAdmin ? `<td>
            <button class="btn btn-danger btn-sm delete-event" data-id="${event.event_id}">Delete</button>
          </td>` : ''}
        </tr>
      `;
    }).join('');

    // Dodanie wiersza z sumą czasu pracy
    eventsList.innerHTML += `
      <tr>
        <td colspan="7" style="text-align: right;"><strong>Suma czasu pracy:</strong></td>
        <td><strong>${totalWorkTime.toFixed(2)}</strong></td>
        ${isAdmin ? '<td></td>' : ''}
      </tr>
    `;

    if (isAdmin) {
      document.querySelectorAll('.delete-event').forEach(button => {
        button.addEventListener('click', deleteEvent);
      });
    }
  }

  function populateEmployeeFilter(events) {
    const employees = [...new Set(events.map(event => event.nick).filter(nick => nick))];
    
    // Sortowanie pracowników w kolejności alfabetycznej
    employees.sort((a, b) => a.localeCompare(b));

    employeeFilter.innerHTML = '<option value="">Select Employee</option>' +
      employees.map(employee => `<option value="${employee}">${employee}</option>`).join('');

    // Ustaw domyślnie pierwszy pracownik, jeśli lista nie jest pusta
    if (employees.length > 0) {
        employeeFilter.value = employees[0];
    }
  }

  function applyFilters() {
    const selectedYear = yearFilter.value;
    const selectedMonth = monthFilter.value.padStart(2, '0');
    const selectedEmployee = employeeFilter.value;

    const filteredEvents = allEvents.filter(event => {
      const [eventYear, eventMonth] = event.event_date.split('-');
      const yearMatch = eventYear === selectedYear;
      const monthMatch = eventMonth === selectedMonth;
      const employeeMatch = !selectedEmployee || event.nick === selectedEmployee;
      return yearMatch && monthMatch && employeeMatch;
    });

    renderEvents(filteredEvents);
  }

  applyFiltersBtn.addEventListener('click', applyFilters);

  function deleteEvent(e) {
    if (!isAdmin) return;
    const eventId = e.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this event?')) {
      fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
        fetchEvents(); // Odśwież listę po usunięciu
      })
      .catch(error => console.error('Error:', error));
    }
  }

  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!isAdmin) return;
      const formData = new FormData(eventForm);
      const eventData = Object.fromEntries(formData.entries());

      // Konwertuj datę na format ISO string
      eventData.event_date = new Date(eventData.event_date).toISOString().split('T')[0];
      
      // Upewnij się, że in_out jest liczbą
      eventData.in_out = parseInt(eventData.in_out);

      fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(() => {
          fetchEvents();
          eventForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });
  }

  initializeFilters();
  fetchEvents();
});
