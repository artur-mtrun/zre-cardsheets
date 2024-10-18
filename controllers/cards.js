const { Card } = require('../models/card');
const { Employee } = require('../models/employee');

exports.getCards = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Card.findAll({
        include: [{
            model: Employee,
            as: 'Employee',
            attributes: ['nick']
        }]
    })
    .then(cards => {
        console.log('karty', cards);
        res.render('cards/card-list', {
            cards: cards,
            pageTitle: 'Wszystkie karty',
            path: '/card-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
    
};
exports.getAddCard = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('cards/add-card', {
        pageTitle: 'Dodaj kartę',
        path: '/add-card',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};
exports.postAddCard = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const cardnumber = req.body.cardnumber;
    const area_id = req.body.area_id;
    const user_id = req.body.user_id;
    Card.create({
        cardnumber: cardnumber,
        area_id: area_id,
        user_id: user_id    
    }).then(result => {
        res.redirect('/card-list');
    }).catch(err => {
        next(err);
    });
};

