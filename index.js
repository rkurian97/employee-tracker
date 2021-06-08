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

const addDepartment= () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter department name: ',
            name: 'department'

        }
    ])
    .then( data =>{
        db.execute(
            `INSERT INTO department (name)
            VALUES ('${data.department}');`
        )
    })
}

const addRole = () => {
    let departments= [];
    db.query(
        'SELECT name FROM department',
        function( err, res){
            for (const element of res){
                departments.push(element.name)
            }
        }
    );

    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter title: ',
            name: 'title'

        },
        {
            type: 'input',
            message: 'Enter salary: ',
            name: 'salary'
        },
        {
            type: 'list',
            message: 'Pick a department',
            name: 'department',
            choices: departments
        }
    ])
    .then( data =>{
        db.execute(
            `INSERT INTO role (title, salary, department_id)
            VALUES ('${data.title}', ${data.salary}, ${departments.indexOf(data.department)+1});`
        )
    })

}

promptAction()
 .then(data => { 
     if (data.action == 'view all departments'){
        viewDepartments();
     }else if (data.action == 'view all roles'){
        viewRoles();
     }else if (data.action == 'view all employees'){
        viewEmployees();
     } else if (data.action== 'add a department'){
        addDepartment();
     } else if (data.action== 'add a role'){
        addRole();
     }
 })
 .catch(err =>{
     console.log(err)
 })