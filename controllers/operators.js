const { Operator } = require('../models/operator');

exports.getOperators = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }else{
    Operator.findAll()
    .then(operators => {
        console.log('operatory findAll');
        console.log(req.session.isLoggedIn);
        res.render('operators/operator-list', {
            operators: operators,
            pageTitle: 'Operatory',
            path: '/operator-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
}
};

exports.postAddOperator = async (req, res, next) => {
    const login = req.body.login;
    const password = req.body.password;
    const area_id = req.body.area_id;
    const is_admin = req.body.is_admin ? true : false;
    Operator.create({
        login: login,
        password: password,
        area_id: area_id,
        is_admin: is_admin
    })
    .then(result => {
        res.redirect('/operator-list');         
    })   
    .catch(err => {
        console.log(err);
    });
};

exports.getAddOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }else{
    res.render('operators/add-operator', {
        pageTitle: 'Dodaj operatora',
        path: '/add-operator',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
}
};


