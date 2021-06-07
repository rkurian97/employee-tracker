const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: process.env.dbpassword,
    database: 'employeetracker'
  }
);

module.exports = db;