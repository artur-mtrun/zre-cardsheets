    const { Machine } = require('../models/machine');

exports.getMachines = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Machine.findAll()
    .then(machines => {
        res.render('machines/machine-list', {
            machines: machines,
            pageTitle: 'Maszyny',
            path: '/machine-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        }); 
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};

exports.getAddMachine = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('machines/add-machine', {
        pageTitle: 'Dodaj maszynę',
        path: '/add-machine',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};

    exports.postAddMachine = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const machine = new Machine({
        machinenumber: req.body.machinenumber,
        descript: req.body.descript,
        area_id: req.body.area_id,
        ip: req.body.ip,
        port: req.body.port
    });

    machine.save()
    .then(result => {
        res.redirect('/machine-list');
    })
    .catch(err => {
        console.log(err);
        next(err);  
    });
};