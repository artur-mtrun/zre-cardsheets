const {Worksheet} = require('../models/worksheet');
const { Employee } = require('../models/employee');
const { Event } = require('../models/event');
const { Op } = require('sequelize');
const { Account } = require('../models/account');


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

exports.getEvents = async (req, res) => {
    console.log('Otrzymano żądanie getEvents z parametrami:', req.query);
    try {
        const { year, month, enrollnumber } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({ message: 'Brak wymaganych parametrów year i month' });
        }

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        console.log('Zakres dat:', { startDate, endDate });

        let whereClause = {
            event_date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (enrollnumber) {
            whereClause.enrollnumber = enrollnumber;
        }

        console.log('Warunek wyszukiwania:', whereClause);

        const events = await Event.findAll({
            where: whereClause,
            order: [['event_date', 'ASC'], ['event_time', 'ASC']]
        });

        console.log('Znalezione wydarzenia:', events);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getWorksheetData = async (req, res) => {
    try {
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
        const { day, month, year, enrollnumber, machinenumber, in_time, out_time, account_id } = req.body;
        
        // Tworzenie daty z otrzymanych danych
        const event_date = new Date(year, month - 1, day);
        console.log('Utworzona data:', event_date);

        // Sprawdzenie, czy wpis już istnieje
        const existingEntry = await Worksheet.findOne({
            where: {
                enrollnumber,
                event_date
            }
        });

        if (existingEntry) {
            console.log('Znaleziono istniejący wpis:', existingEntry);
            return res.status(400).json({ message: 'Wpis dla tego dnia i pracownika już istnieje' });
        }

        // Tworzenie nowego wpisu
        const newEntry = await Worksheet.create({
            enrollnumber,
            event_date,
            machinenumber,
            in_time,
            out_time,
            account_id
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
        console.log('Controller: Otrzymano żądanie getAccounts');
        const accounts = await Account.findAll({
            attributes: ['account_id', 'account_number', 'account_descript'],
            order: [['account_number', 'ASC']]
        });
        console.log('Controller: Pobrano konta:', accounts);
        res.json(accounts);
    } catch (error) {
        console.error('Błąd podczas pobierania kont:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};
