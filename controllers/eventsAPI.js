const { Sequelize } = require('sequelize');
const {Event} = require('../models/event');
const {Employee} = require('../models/employee');

exports.getAllEvents = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
}
  try {
    const events = await Event.findAll({
      attributes: [
        'event_id',
        'machinenumber',
        'enrollnumber',
        'in_out',
        'event_date',
        'event_time',
        [Sequelize.literal(`(SELECT "nick" FROM "employees" WHERE "employees"."enrollnumber" = "event"."enrollnumber")`), 'nick']
      ],
      //order: [['event_date', 'DESC'], ['event_time', 'DESC']]
      order: [['event_date', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
}
  try {
    const { machinenumber, enrollnumber, in_out, event_date, event_time } = req.body;
    const event = await Event.create({
      machinenumber,
      enrollnumber,
      in_out,
      event_date,
      event_time
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
}
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      await event.update(req.body);
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
      const eventId = req.params.id;
      const event = await Event.findByPk(eventId);
      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }
      await event.destroy();
      res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
      next(err);
  }
};

exports.getEventsByMonth = async (req, res) => {
    try {
        const { year, month, enrollnumber } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        let whereClause = {
            event_date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (enrollnumber) {
            whereClause.enrollnumber = enrollnumber;
        }

        const events = await Event.findAll({
            where: whereClause,
            order: [['event_date', 'DESC'], ['event_time', 'ASC']]
        });

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEventsByMonthAndEmployee = async (req, res) => {
    try {
        const { year, month, enrollnumber } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const events = await Event.findAll({
            where: {
                event_date: {
                    [Sequelize.Op.between]: [startDate, endDate]
                },
                enrollnumber: enrollnumber
            },
            attributes: [
                'event_id', 'machinenumber', 'enrollnumber', 'in_out', 'event_date', 'event_time',
                [Sequelize.literal(`(SELECT "nick" FROM "employees" WHERE "employees"."enrollnumber" = "event"."enrollnumber")`), 'nick']
            ],
            order: [['event_date', 'ASC'], ['event_time', 'ASC']]
        });

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEmployees = async (req, res) => {
  try {
      const employees = await Employee.findAll({
          attributes: ['enrollnumber', 'nick'],
          order: [['nick', 'ASC']]
      });
      res.json(employees);
  } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}