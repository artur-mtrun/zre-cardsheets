const {Worksheet} = require('../models/worksheet');
const { Employee } = require('../models/employee');
const { Event } = require('../models/event');
const { Op } = require('sequelize');
const { Account } = require('../models/account');
const { getEventsByMonthAndEmployee } = require('./eventsAPI');
const { Company } = require('../models/company');


exports.getWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.findAll();
    res.json(worksheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWorksheet = async (req, res) => {
  try {
    const worksheet = await Worksheet.create(req.body);
    res.status(201).json(worksheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAllEmployees = async (req, res) => {
    console.log('Otrzymano żądanie getAllEmployees');
    try {
        const employees = await Employee.findAll({
            attributes: ['enrollnumber', 'nick'],
            order: [['nick', 'ASC']]
        });
        console.log('Znaleziono pracowników:', employees);
        res.json(employees);
    } catch (err) {
        console.error('Błąd podczas pobierania pracowników:', err);
        res.status(500).json({ message: 'Wystąpił błąd serwera' });
    }
};

exports.getEvents = getEventsByMonthAndEmployee;

exports.getWorksheetData = async (req, res) => {
    try {
        console.log('Dupa dupa dupa Otrzymano żądanie getWorksheetData z parametrami:', req.query);
        const { year, month, enrollnumber } = req.query;
        console.log('Pobieranie danych arkusza roboczego dla:', { year, month, enrollnumber });
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        console.log('Zakres dat:', { startDate, endDate });

        const worksheetData = await Worksheet.findAll({
            where: {
                enrollnumber: enrollnumber,
                event_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{ model: Account, attributes: ['account_number', 'account_descript'] }],
            order: [['event_date', 'ASC'], ['in_time', 'ASC']]
        });

        console.log('Dane arkusza roboczego:', worksheetData);

        res.json(worksheetData);
    } catch (error) {
        console.error('Błąd podczas pobierania danych arkusza roboczego:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.addWorksheetEntry = async (req, res) => {
    try {
        const { day, month, year, enrollnumber, machinenumber, in_time, out_time, account_id, work_time } = req.body;
        
        console.log('Otrzymany czas pracy:', work_time); // Dodaj to dla debugowania

        // Sprawdź, czy pracownik istnieje
        const employee = await Employee.findOne({
            where: { enrollnumber: enrollnumber }
        });

        if (!employee) {
            return res.status(400).json({ message: 'Nie znaleziono pracownika o podanym enrollnumber' });
        }

        // Tworzenie daty z otrzymanych danych
        const event_date = new Date(year, month - 1, day);
        console.log('Utworzona data:', event_date);

        // Tworzenie nowego wpisu
        const newEntry = await Worksheet.create({
            enrollnumber,
            event_date,
            machinenumber,
            in_time,
            out_time,
            account_id,
            company_id: employee.company_id,
            work_time // Używamy przesłanej wartości work_time bez modyfikacji
        });

        console.log('Utworzony nowy wpis:', newEntry);

        res.status(201).json({ message: 'Wpis dodany pomyślnie', entry: newEntry });
    } catch (error) {
        console.error('Błąd podczas dodawania wpisu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas dodawania wpisu', error: error.message });
    }
};

exports.postEditEntry = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Otrzymane ID do edycji:', id);
        const { day, month, year, enrollnumber, machinenumber, in_time, out_time, account_id } = req.body;
        
        const event_date = new Date(year, month - 1, day);

        const [updatedCount, updatedEntries] = await Worksheet.update(
            {
                enrollnumber,
                event_date,
                machinenumber,
                in_time,
                out_time,
                account_id
            },
            {
                where: { worksheet_id: id },
                returning: true
            }
        );

        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Wpis nie został znaleziony' });
        }

        res.status(200).json({ message: 'Wpis zaktualizowany pomyślnie', entry: updatedEntries[0] });
    } catch (error) {
        console.error('Błąd podczas aktualizacji wpisu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji wpisu', error: error.message });
    }
};

// Dodaj nową funkcję do pobierania kont (będzie używana do wypełniania select'a w formularzu)
exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            attributes: ['account_id', 'account_number', 'account_descript'],
            order: [['account_number', 'ASC']]
        });
        res.json(accounts);
    } catch (error) {
        console.error('Błąd podczas pobierania kont:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.getWorksheetDataForDay = async (req, res) => {
    try {
        const { year, month, day, enrollnumber } = req.query;
        const date = new Date(year, month - 1, day);

        const worksheetData = await Worksheet.findOne({
            where: {
                enrollnumber: enrollnumber,
                event_date: date
            }
        });

        res.json(worksheetData);
    } catch (error) {
        console.error('Błąd podczas pobierania danych Worksheet:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.getEmployeeData = async (req, res) => {
    try {
        const { enrollnumber } = req.query;
        console.log('Szukam pracownika o enrollnumber:', enrollnumber);
        
        const employee = await Employee.findOne({
            where: { enrollnumber: enrollnumber },
            attributes: ['enrollnumber', 'company_id'],
            include: [{
                model: Company,
                as: 'Company',  // Dodajemy alias 'company'
                attributes: ['company_id', 'company_descript']
            }]
        });

        console.log('Znaleziony pracownik:', employee);

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Pracownik nie znaleziony' });
        }
    } catch (error) {
        console.error('Błąd podczas pobierania danych pracownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.toString() });
    }
};
