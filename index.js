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
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee manager', 'update an employee role', 'end session']
        }
    ]);
};

const viewDepartments= () =>{
    db.query(
        'SELECT * FROM department',
        function( err, res){
            console.table(res)
            runEmployeeTracker();
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
            runEmployeeTracker();
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
            runEmployeeTracker();
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
        runEmployeeTracker();
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
        runEmployeeTracker();
    })

}

const addEmployee= () => {
    let roles= [];
    db.query(
        'SELECT title FROM role',
        function( err, res){
            for (const element of res){
                roles.push(element.title)
            }
        }
    );

    let employees= ['None'];
    db.query( 
        'SELECT concat(first_name, " ", last_name) as manager FROM employee',
        function( err, res){
            for (const element of res){
                employees.push(element.manager)
            }
        }
    );
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter first name: ',
            name: 'first'

        },
        {
            type: 'input',
            message: 'Enter last name: ',
            name: 'last'
        },
        {
            type: 'list',
            message: 'Pick a role',
            name: 'role',
            choices: roles
        },
        {
            type: 'list',
            message: 'Pick a manager',
            name: 'manager',
            choices: employees
        }
    ])
    .then( data =>{
        if (data.manager=='None'){
            db.execute(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${data.first}', '${data.last}', ${roles.indexOf(data.role)+1}, NULL);`
            )
        } else {
            db.execute(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${data.first}', '${data.last}', ${roles.indexOf(data.role)+1}, ${employees.indexOf(data.manager)});`
            )
        }
        runEmployeeTracker();
    })
}

const updateEmpManager= () =>{

    let employees= [];
    let managers= ['None'];
    db.query( 
        'SELECT concat(first_name, " ", last_name) as manager FROM employee',
        function( err, res){
            for (const element of res){
                employees.push(element.manager)
                managers.push(element.manager)
            }
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Pick an employee',
                    name: 'employee',
                    choices: employees
                },
                {
                    type: 'list',
                    message: 'Pick a manager',
                    name: 'manager',
                    choices: managers
                }
            ])
            .then( data =>{
                if (data.manager=='None'){
                    db.execute(
                        `Update employee 
                        SET manager_id= NULL
                        WHERE id= ${employees.indexOf(data.employee)+1}
                        `
                    )
                } else {
                    db.execute(
                        `Update employee 
                        SET manager_id= ${employees.indexOf(data.manager)}
                        WHERE id= ${employees.indexOf(data.employee)+1}
                        `
                    )
                }
            })
            runEmployeeTracker();
        }
    );
}

const updateEmpRole= () =>{

    let employees= [];
    let roles= [];

    db.query(
        'SELECT title FROM role',
        function( err, res){
            for (const element of res){
                roles.push(element.title)
            }
        }
    );
    
    db.query( 
        'SELECT concat(first_name, " ", last_name) as employees FROM employee',
        function( err, res){
            for (const element of res){
                employees.push(element.employees)
            }
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Pick an employee',
                    name: 'employee',
                    choices: employees
                },
                {
                    type: 'list',
                    message: 'Pick a role',
                    name: 'newRole',
                    choices: roles
                }
            ])
            .then( data =>{
                    db.execute(
                        `Update employee 
                        SET role_id= ${roles.indexOf(data.newRole)+1}
                        WHERE id= ${employees.indexOf(data.employee)+1}
                        `
                    )

                    runEmployeeTracker();

            })
        }
    );
}

const runEmployeeTracker= ()=>{
    promptAction()
    .then(data => { 
        if (data.action == 'view all departments'){
           viewDepartments();
        }else if (data.action == 'view all roles'){
           viewRoles();
        }else if (data.action == 'view all employees'){
           viewEmployees();
           runEmployeeTracker();
        } else if (data.action== 'add a department'){
           addDepartment();
        } else if (data.action== 'add a role'){
           addRole();
        } else if (data.action== 'add an employee'){
           addEmployee();
        } else if (data.action== 'update an employee manager'){
           updateEmpManager();
        } else if (data.action== 'update an employee role'){
           updateEmpRole();
        }else {
            process.exit();
        }
    })
    .catch(err =>{
        console.log(err)
    })
}

runEmployeeTracker();