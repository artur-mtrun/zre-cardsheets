const { Operator } = require('../models/operator');
const { Area } = require('../models/area');

exports.getOperators = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const operators = await Operator.findAll({
            include: [{ model: Area, as: 'Area', attributes: ['descript'] }]
        });
        res.render('operators/operator-list', {
            operators: operators,
            pageTitle: 'Operatory',
            path: '/operator-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postAddOperator = async (req, res, next) => {
    const { login, password, area_id, is_admin } = req.body;
    try {
        await Operator.create({
            login: login,
            password: password,
            area_id: parseInt(area_id),
            is_admin: is_admin === 'true'
        });
        res.redirect('/operator-list');         
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getAddOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const areas = await Area.findAll();
        res.render('operators/add-operator', {
            pageTitle: 'Dodaj operatora',
            path: '/add-operator',
            areas: [{ area_id: 0, descript: 'Wszystkie obszary' }, ...areas],
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
