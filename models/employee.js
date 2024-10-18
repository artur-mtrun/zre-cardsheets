const Card = require('./card');
const {Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Employee extends Model {}

Employee.init({
    employee_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        initialAutoIncrement: 20000
    },
    nick: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enrollnumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true // Dodajemy unikalność dla enrollnumber
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cardnumber: {         
        type: DataTypes.INTEGER,
        allowNull: false
    },
    to_send: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'employee',
    indexes: [
        {
            unique: true,
            fields: ['enrollnumber']
        }
    ]
});

module.exports = { Employee };
