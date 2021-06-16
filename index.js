//dependencies
require('dotenv').config()
const db= require('./db/connection');
const table = require('console.table');
const inquirer = require('inquirer');

//starting prompt to show options
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

// show the department table
const viewDepartments= async () =>{
    const data= await db.promise().query('SELECT * FROM department');
    console.table(data[0]);
};

// show role table
const viewRoles= async () =>{
    const data= await db.promise().query(
        `Select r.id, r.title, r.salary, d.name as 'department'
        From role r
        join department d
        on r.department_id=d.id
        `
    );

    console.table(data[0]);
}

//show employee table
const viewEmployees= async () =>{
    const data= await db.promise().query(
        `Select e.id, e.first_name, e.last_name, r.title, concat(b.first_name, " ", b.last_name) as 'manager'
        from employee e
        join role r
        on e.role_id=r.id
        left join employee b
        on e.manager_id=b.id;`
    );
    console.table(data[0]);
}

// add a department
const addDepartment= () => {

   inquirer.prompt([
        {
            type: 'input',
            message: 'Enter department name: ',
            name: 'department'

        }
    ])
    .then(data =>{
        db.promise().query(
            `INSERT INTO department (name)
             VALUES ('${data.department}');`
        );
    })
}

const addRole = async() => {
    // grab the current departments and put into an array
    let departments= await getDepartments();

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
        db.promise().query(
            `INSERT INTO role (title, salary, department_id)
            VALUES ('${data.title}', ${data.salary}, ${departments.indexOf(data.department)+1});`
        )
    })
}

const addEmployee= async () => {
    let roles= await getRoles();

    let managers= ['None'];
    managers= await getEmployees(managers);

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
            choices: managers
        }
    ])
    .then( data =>{
        if (data.manager=='None'){
            db.promise().query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${data.first}', '${data.last}', ${roles.indexOf(data.role)+1}, NULL);`
            )
        } else {
            db.promise().query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${data.first}', '${data.last}', ${roles.indexOf(data.role)+1}, ${managers.indexOf(data.manager)});`
            )
        }
    })
}

const updateEmpManager= async () =>{
    let employees= [];
    employees= await getEmployees(employees);
    

    let managers= ['None'];
    managers= await getEmployees(managers);

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
            db.promise().query(
                `Update employee 
                SET manager_id= NULL
                WHERE id= ${employees.indexOf(data.employee)+1}
                `
            )
        } else {
            db.promise().query(
                `Update employee 
                SET manager_id= ${managers.indexOf(data.manager)}
                WHERE id= ${employees.indexOf(data.employee)+1}
                `
            )
        }
    })
}

const updateEmpRole= async() =>{

    let employees= [];
    let roles= [];

    employees= await getEmployees(employees);
    roles= await getRoles();

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
            db.promise().execute(
                `Update employee 
                SET role_id= ${roles.indexOf(data.newRole)+1}
                WHERE id= ${employees.indexOf(data.employee)+1}
                `
            )

    })
}

const getDepartments= async ()=> {
    let departments= [];
    const data= await db.promise().query(
        'SELECT name FROM department'
    );
    for (const element of data[0]){
        departments.push(element.name)
    }
    return departments
};

const getRoles= async()=> {
    let roles= [];
    const data= await db.promise().query(
        'SELECT title FROM role'
    );

    for (const element of data[0]){
        roles.push(element.title)
    }

    return roles
};

const getEmployees= async (employees)=> {
    const data=  await db.promise().query( 'SELECT concat(first_name, " ", last_name) as manager FROM employee');
    for (const element of data[0]){
        employees.push(element.manager)
    }
    return employees
};


const runEmployeeTracker= ()=>{
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