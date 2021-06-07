require('dotenv').config()
const db= require('./db/connection');
const table = require('console.table');
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

const viewDepartments= () =>{
    db.query(
        'SELECT * FROM department',
        function( err, res){
            console.table(res)
        }
    );
};

const viewRoles= () =>{
    db.query(
        `Select r.id, r.title, r.salary, d.name as 'department'
        From role r
        join department d
        on r.department_id=d.id
        `,
        function( err, res){
            console.table(res)
        }
    );
}

const viewEmployees= () =>{
    db.query(
        `Select e.id, e.first_name, e.last_name, r.title, concat(b.first_name, " ", b.last_name) as 'manager'
        from employee e
        join role r
        on e.role_id=r.id
        left join employee b
        on b.manager_id=e.id;`,
        function( err, res){
            console.table(res)
        }
    );
}


promptAction()
 .then(data => { 
     if (data.action == 'view all departments'){
        viewDepartments();
     }else if (data.action == 'view all roles'){
        viewRoles();
     }else if (data.action == 'view all employees'){
        viewEmployees();
     }
 })
 .catch(err =>{
     console.log(err)
 })