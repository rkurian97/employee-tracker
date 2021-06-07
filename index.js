const db= require('./db/connection');
const inquirer = require('inquirer');

const promptAction= () =>{
    return inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do',
            name: 'action',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role']
        }
    ]);
};

const viewDepartment= () =>{
    db.query(
        'SELECT * FROM department'
    );
}


promptAction()
 .then(data => { 
     if (data.action == 'view all departments'){
        viewDepartment();
     }
 })
 .catch(err =>{
     console.log(err)
 })