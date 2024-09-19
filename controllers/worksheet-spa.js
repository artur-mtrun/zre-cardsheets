function fetchEvents(year, month) {
    console.log(`Fetching events for ${year}-${month}`);
    fetch(`/api/events?year=${year}&month=${month + 1}`)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            events = data;
            generateCalendar(year, month);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}
