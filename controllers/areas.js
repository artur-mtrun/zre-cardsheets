const { Area } = require('../models/area');

exports.getAreas = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Area.findAll()
    .then(areas => {
        res.render('areas/area-list', {
            areas: areas,
            pageTitle: 'Lista obszarów',
            path: '/area-list',
            isAuthenticated: req.session.isLoggedIn, 
            isAdmin: req.session.isAdmin
        });
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};
exports.getAddArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('areas/add-area', {
        pageTitle: 'Dodaj obszar',
        path: '/add-area',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};  
exports.postAddArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const area = new Area({
        area_id: req.body.area_id,
        descriript: req.body.descriript
    });

    area.save()
    .then(result => {
        res.redirect('/area-list'); 
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};

