document.addEventListener('DOMContentLoaded', initializePage);

let currentYear, currentMonth;

function initializePage() {
    initializeFilters();
    fetchAccounts();
    fetchCompanies();
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

function fetchAccounts() {
    fetch('/api/worksheet/accounts')
        .then(response => response.json())
        .then(accounts => {
            const accountFilter = document.getElementById('account-filter');
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.account_id;
                option.textContent = `${account.account_number} - ${account.account_descript}`;
                accountFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching accounts:', error));
}

function fetchCompanies() {
    fetch('/api/worksheet/companies')
        .then(response => response.json())
        .then(companies => {
            const companyFilter = document.getElementById('company-filter');
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.company_id;
                option.textContent = company.company_descript;
                companyFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
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
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function addEventListeners() {
    document.getElementById('generate-report').addEventListener('click', generateReport);
}

function generateReport() {
    const year = document.getElementById('year-filter').value;
    const month = document.getElementById('month-filter').value;
    const accountId = document.getElementById('account-filter').value;
    const companyId = document.getElementById('company-filter').value;
    const employeeId = document.getElementById('employee-filter').value;

    let url = `/api/worksheet/report?year=${year}&month=${month}`;
    if (accountId) url += `&account_id=${accountId}`;
    if (companyId) url += `&company_id=${companyId}`;
    if (employeeId) url += `&employee_id=${employeeId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateReportTable(data);
        })
        .catch(error => console.error('Error generating report:', error));
}

function updateReportTable(data) {
    const tableBody = document.querySelector('#report-table tbody');
    tableBody.innerHTML = '';
    
    let totalMinutes = 0;

    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.event_date)}</td>
            <td>${entry.employee_nick}</td>
            <td>${entry.company_descript}</td>
            <td>${entry.account_number} - ${entry.account_descript}</td>
            <td>${formatTime(entry.in_time)}</td>
            <td>${formatTime(entry.out_time)}</td>
            <td>${formatWorkTime(entry.work_time)}</td>
        `;
        tableBody.appendChild(row);
        
        totalMinutes += entry.work_time || 0;
    });

    // Dodaj wiersz podsumowania
    const summaryRow = document.createElement('tr');
    summaryRow.innerHTML = `
        <td colspan="6" style="text-align: right;"><strong>Suma czasu pracy:</strong></td>
        <td><strong>${formatWorkTime(totalMinutes)}</strong></td>
    `;
    tableBody.appendChild(summaryRow);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}

function formatTime(timeString) {
    return timeString ? timeString.slice(0, 5) : '';
}

function formatWorkTime(minutes) {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
