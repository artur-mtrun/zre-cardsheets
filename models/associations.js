const { Company } = require('./company');
const { Employee } = require('./employee');
const { Worksheet } = require('./worksheet');
const { Account } = require('./account');
const { Card } = require('./card');

// Istniejące asocjacje
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });
Company.hasMany(Employee, { foreignKey: 'company_id', as: 'Employees' });


// Nowe asocjacje dla Worksheet
Company.hasMany(Worksheet, { foreignKey: 'company_id', as: 'Worksheets' });
Worksheet.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });

Worksheet.belongsTo(Account, { foreignKey: 'account_id', as: 'Account' });
Account.hasMany(Worksheet, { foreignKey: 'account_id', as: 'Worksheets' });

// Powiązanie między Employee a Worksheet
Employee.hasMany(Worksheet, { foreignKey: 'enrollnumber', sourceKey: 'enrollnumber' });
Worksheet.belongsTo(Employee, { foreignKey: 'enrollnumber', targetKey: 'enrollnumber' });

// Zmodyfikowana asocjacja między Card a Employee
Card.belongsTo(Employee, { 
  foreignKey: 'cardnumber', 
  targetKey: 'cardnumber', 
  as: 'Employee',
  constraints: false // Dodajemy tę opcję
});
Employee.hasOne(Card, { 
  foreignKey: 'cardnumber', 
  sourceKey: 'cardnumber', 
  as: 'Card',
  constraints: false // Dodajemy tę opcję
});

module.exports = { Company, Employee, Worksheet, Account, Card };
