const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: process.env.dbpassword,
    database: 'employeetracker'
  },
  console.log('Connected to the employee database.')
);

module.exports = db;