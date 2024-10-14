const { Employee, Company } = require('../models/associations');
const { validationResult } = require('express-validator');
const { 
    checkAuth, 
    handleValidationErrors, 
    renderViewWithError, 
    getLastEmployeeNumber 
} = require('../utils/helpers');

exports.getEmployees = async (req, res, next) => {
    if (!checkAuth(req, res)) return;

    let findOptions = {
        include: [{ model: Company, as: 'Company' }]
    };
    
    if (req.session.area_id !== 0) {
        findOptions.where = { area_id: req.session.area_id };
    }

    try {
        const employees = await Employee.findAll(findOptions);
        console.log(req.session.area_id === 0 
            ? 'Wyświetlanie wszystkich pracowników' 
            : `Wyświetlanie pracowników dla area_id: ${req.session.area_id}`);
        
        renderViewWithError(res, 'employees/employee-list', {
            req,
            employees,
            pageTitle: 'Pracownicy',
            path: '/',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
exports.getAddEmployee = async(req, res, next) => {
    if (!checkAuth(req, res)) return;

    try {
        const new_enrollnumber = await getLastEmployeeNumber();
        const companies = await Company.findAll();
        console.log('Nowy numer pracownika:', new_enrollnumber);
        
        renderViewWithError(res, 'employees/add-employee', {
            req,
            new_enrollnumber,
            companies,
            pageTitle: 'Dodaj Pracownika',
            path: '/add-employee',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin,
            session: req.session
        });
    } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
        next(err);
    }
};
exports.postAddEmployee = async (req, res, next) => {
    if (!checkAuth(req, res)) return;
    console.log('Dodawanie pracownika');
    const { nick, enrollnumber, area_id, cardnumber, company_id } = req.body;
    const to_send = true;
    const errors = validationResult(req);
    
    if (handleValidationErrors(req, errors)) {
        // Jeśli są błędy walidacji, zapisz sesję i przekieruj
        return req.session.save(err => {
            if (err) {
                console.error('Błąd zapisu sesji:', err);
            }
            res.redirect('/add-employee');
        });
    }
    
    console.log('Dodawanie pracownika: ', nick, enrollnumber, area_id, cardnumber, company_id, to_send);
    try {
        await Employee.create({
            nick,
            enrollnumber,
            area_id,
            cardnumber,
            company_id,
            to_send
        });
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};
exports.postRemoveCard = async (req, res, next) => {
    if (!checkAuth(req, res)) return;
    const employee_id = req.body.employee_id;
    console.log('Usuwanie karty dla pracownika: ', employee_id);
    try {
        // Znajdź pracownika
        const employee = await Employee.findByPk(employee_id);
        
        if (!employee) {
            console.log('Nie znaleziono pracownika.',employee_id);
            return res.redirect('/');
        }
        // Usuń przypisanie karty do pracownika
        employee.cardnumber = 0;
        await employee.save();

        // Przekieruj z powrotem do listy pracowników
        res.redirect('/');
    } catch (error) {
        console.error('Błąd podczas usuwania karty:', error);
        next(error);
    }
};


exports.postAssignCard = async (req, res, next) => {
    if (!checkAuth(req, res)) return;
    const employee_id = req.body.employee_id;
    const cardnumber = req.body.cardnumber;
    const errors = validationResult(req);
    if(handleValidationErrors(req, errors)) {
        return req.session.save(err => {
            if(err) {
                console.error('Błąd zapisu sesji:', err);
            }
            res.redirect('/');
        });
    }
    try {
        console.log('Szukanie pracownika');
        const employee = await Employee.findByPk(employee_id);
        if (!employee) {
            console.log('Nie znaleziono pracownika');
            return res.redirect('/');
        }
        console.log('Pracownik: ', employee);
        console.log('Nowa karta: ', cardnumber);
        employee.cardnumber = cardnumber;
        console.log('Karta po zmianie: ', employee.cardnumber);
        await employee.save();
        console.log("Karta została pomyślnie przypisana do pracownika.");
        console.log('Karta po zmianie na końcu: ', employee.cardnumber);
        res.redirect('/');
    } catch (error) {
        console.error('Błąd podczas przypisywania karty:', error);
        next(error);
    }
};
//początek wydzielania



