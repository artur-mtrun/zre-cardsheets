const { Company } = require('./company');
const { Employee } = require('./employee');

Company.hasMany(Employee, { foreignKey: 'company_id', as: 'Employees' });
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });

module.exports = { Company, Employee };
