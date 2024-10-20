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
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
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

function generatePDF() {
    // Sprawdź, czy jsPDF jest dostępny globalnie
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF nie jest załadowany. Upewnij się, że skrypt jest poprawnie dołączony.');
        return;
    }

    const doc = new window.jspdf.jsPDF();
    
    // Dodaj czcionkę obsługującą polskie znaki
    // Uwaga: Upewnij się, że ścieżka do czcionki jest poprawna
    doc.addFont('/fonts/roboto.ttf', 'Polish', 'normal');
    doc.setFont('Polish');

    // Tytuł raportu
    doc.setFontSize(18);
    const title = `Raport za ${document.getElementById('month-filter').options[document.getElementById('month-filter').selectedIndex].text} ${document.getElementById('year-filter').value}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    // Opcje filtra
    doc.setFontSize(11);
    let yPosition = 30;

    const accountFilter = document.getElementById('account-filter');
    if (accountFilter.value !== "") {
        doc.text(`Konto: ${accountFilter.options[accountFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }
    
    const companyFilter = document.getElementById('company-filter');
    if (companyFilter.value !== "") {
        doc.text(`Firma: ${companyFilter.options[companyFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }
    
    const employeeFilter = document.getElementById('employee-filter');
    if (employeeFilter.value !== "") {
        doc.text(`Pracownik: ${employeeFilter.options[employeeFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }

    // Tabela
    const table = document.getElementById('report-table');
    
    doc.autoTable({
        html: table,
        startY: yPosition + 15,
        styles: { font: 'Polish', fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40 }
    });

    doc.save('raport.pdf');
}
