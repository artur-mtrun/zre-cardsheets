const { Company } = require('./company');
const { Employee } = require('./employee');
const { Worksheet } = require('./worksheet');
const { Account } = require('./account');

// Istniejące asocjacje
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });
Company.hasMany(Employee, { foreignKey: 'company_id', as: 'Employees' });


// Nowe asocjacje dla Worksheet
Company.hasMany(Worksheet, { foreignKey: 'company_id', as: 'Worksheets' });
Worksheet.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });

Worksheet.belongsTo(Account, { foreignKey: 'account_id', as: 'Account' });
Account.hasMany(Worksheet, { foreignKey: 'account_id', as: 'Worksheets' });

// Możesz również dodać powiązanie między Employee a Worksheet, jeśli jest to potrzebne
Employee.hasMany(Worksheet, { foreignKey: 'enrollnumber', as: 'Worksheets' });
Worksheet.belongsTo(Employee, { foreignKey: 'enrollnumber', as: 'Employee' });

module.exports = { Company, Employee, Worksheet, Account };
