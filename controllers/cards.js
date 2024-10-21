const { Card } = require('../models/card');
const { Employee } = require('../models/employee');
const { Area } = require('../models/area');

exports.getCards = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Card.findAll({
        include: [
            {
                model: Employee,
                as: 'Employee',
                attributes: ['nick']
            },
            {
                model: Area,
                as: 'Area',
                attributes: ['descript']
            }
        ]
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

exports.getAddCard = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const areas = await Area.findAll();
        res.render('cards/add-card', {
            pageTitle: 'Dodaj kartę',
            path: '/add-card',
            areas: areas,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postAddCard = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const { cardnumber, area_id } = req.body;
        console.log('Próba dodania karty:', { cardnumber, area_id });

        // Sprawdź, czy karta już istnieje
        const existingCard = await Card.findOne({ where: { cardnumber } });
        if (existingCard) {
            throw new Error('Karta o tym numerze już istnieje');
        }

        // Utwórz nową kartę
        const newCard = await Card.create({ 
            cardnumber: parseInt(cardnumber), 
            area_id: parseInt(area_id) 
        });
        console.log('Karta dodana pomyślnie:', newCard.toJSON());

        res.redirect('/card-list');
    } catch (error) {
        console.error('Błąd podczas dodawania karty:', error);
        const areas = await Area.findAll();
        res.status(400).render('cards/add-card', {
            pageTitle: 'Dodaj kartę',
            path: '/add-card',
            errorMessage: error.message,
            areas: areas,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    }
};

exports.postDeleteCard = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const cardNumber = req.body.cardNumber;

    try {
        const card = await Card.findOne({ where: { cardnumber: cardNumber } });

        if (!card) {
            return res.status(404).json({ message: 'Karta nie znaleziona' });
        }

        if (card.Employee) {
            return res.status(400).json({ message: 'Nie można usunąć przypisanej karty' });
        }

        await card.destroy();
        res.redirect('/card-list');
    } catch (err) {
        console.error('Błąd podczas usuwania karty:', err);
        next(err);
    }
};
