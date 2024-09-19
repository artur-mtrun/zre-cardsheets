const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Worksheet = sequelize.define('worksheet', {
 
    worksheet_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    machinenumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    enrollnumber: {     
        type: DataTypes.INTEGER,
        allowNull: false
    },
    event_date: {   
        type: DataTypes.DATE,
        allowNull: false
    },
    in_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    out_time: {
        type: DataTypes.TIME,
        allowNull: false
    }
});

module.exports = {Worksheet, Event};