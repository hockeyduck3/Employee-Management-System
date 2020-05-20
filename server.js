// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');

// While the dependency is not called anywhere, it will overwrite the built in console.table.
const cTable = require('console.table');

// Connection to the local sql server
const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',

    password: '',
    
    database: 'employee_database'
});

// Connect to the sql server and start the program
connection.connect((err) => {
    if (err) throw err;

    console.log('\nWelcome to the Employee Management App!\n')

    init();
});

const fieldValidation = async input => {
    if (input.trim() === '') {
       return 'Field cannot be left blank';
    }

    return true;
}

// First function to run
function init() {
    inquirer
     .prompt({
        type: 'list',
        name: 'firstQuestion',
        message: 'What would you like to do?',
        choices: [
            'View All Employee\'s', 
            'View All Employees By Department', 
            'View Employee\'s By Manager', 
            'Add New Employee', 
            'Add Department', 
            'Remove An Employee', 
            'Update Employee Role', 
            'Update Employee Manager', 
            'Exit'
        ]
     })
     .then(function(answer) {
        switch(answer.firstQuestion) {
            case 'View All Employee\'s':
                viewAllEmployees();
                break;

            case 'View All Employees By Department':
                break;

            case 'View All Employees By Manager':
                break;

            case 'Add New Employee':
                addNewEmployee();
                break;

            case 'Add Department':
                addDepartment();
                break;

            case 'Remove An Employee':
                removeEmployee();
                break;

            case 'Update Employee Role':
                break;

            case 'Update Employee Manager':
                break;
                
            default:
                console.log('See ya later!');
                connection.end();
        }
     });
}

// Funtion to see all the Employees in the database
function viewAllEmployees() {
    connection.query(
        'SELECT * FROM employee',

        function (err, res) {
            if (err) throw err;

            var employeeArr = [];

            for (let i = 0; i < res.length; i++) {
                var employeeObj = {
                    id: res[i].id,
                    first_name: res[i].first_name,
                    last_name: res[i].last_name
                }

                employeeArr.push(employeeObj);
            }

            // Added in the line breaks before and after the table for readability
            console.table(`\n ${employeeArr} \n`);

            init();
        }
    );
}

// Function to add employee's to the database
function addNewEmployee() {
    var roleChoices = [];
    var managerChoice = [];

    // Query for grabbing the different roles in the company
    connection.query(
        'SELECT * FROM role',

        function(err, res) {
            if (err) throw err;

            res.forEach(element => {
                var roleChoicesVal = {
                    name: element.title,
                    value: {
                        role_id: element.id
                    }
                }

                roleChoices.push(roleChoicesVal);
            });
        }
    );

    connection.query(
        'SELECT id, first_name, last_name FROM employee',

        function (err, res) {
            if (err) throw err;

            res.forEach(element => {
                var managerChoiceVal = {
                    name: `${element.first_name} ${element.last_name}`,
                    value: {
                        id: element.id
                    }
                }

                managerChoice.push(managerChoiceVal);
            });

            managerChoice.push('No one')
        }
    );

    const questions = [
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the employee\'s first name?',
            validate: fieldValidation
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the employee\'s last name?',
            validate: fieldValidation
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is the employee\'s role?',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: managerChoice
        }
    ];

    inquirer
     .prompt(questions)
     .then(function(answer) {
        let managerAnswer;

        if (answer.manager !== 'No one') {
            managerAnswer = answer.manager.id;
        } else {
            managerAnswer = null;
        }

        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.role.role_id,
                manager_id: managerAnswer
            },
            function(err) {
                if (err) throw err;

                console.log(`\n${answer.firstName} ${answer.lastName} has been added to the Employee database!\n`);

                init();
            }
        );
     });
}

// Function to add a department
function addDepartment() {
    inquirer
     .prompt({
         type: 'input',
         name: 'departmentName',
         message: 'What would you like to name this department?'
     })
     .then(function(answer) {
        connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.departmentName
            },
            function(err) {
                if (err) throw err;

                console.log(`${answer.departmentName} has been added to the database!`);

                init();
            }
        );
     });
}

// Function for removing employee's from the database
function removeEmployee() {
    connection.query(
        'SELECT * FROM employee',

        // Function for creating the choices for the inquirer prompt
        function (err, res) {
            if (err) throw err;

            var choiceArr = [];

            for (let i = 0; i < res.length; i++) {
                // Saving the values in and object and then pushing the object into the array will allow the .then code to search by id instead of by name.
                // This way in case there is an Employee with the same name you can delete the exact one you want without worrying about deleting the other.
                var choiceVal = {
                    name: `id: ${res[i].id} || name: ${res[i].first_name} ${res[i].last_name}`,
                    value: {
                        id: res[i].id,
                        name: `${res[i].first_name} ${res[i].last_name}`
                    }
                };

                choiceArr.push(choiceVal);
            }

            inquirer
             .prompt(
                {
                    type: 'list',
                    name: 'removeEmployee',
                    choices: choiceArr,
                    message: 'Which employee would you like to remove from the database?'
                }
             )
             .then(function(answer) {
                let id = answer.removeEmployee.id;
                let employeeName = answer.removeEmployee.name;

                connection.query(
                    'DELETE FROM employee WHERE ?',

                    {
                        id: id
                    },

                    function (err) {
                        if (err) throw err;

                        console.log(`${employeeName} has been removed from the database!`);

                        init();
                    }
                );
             });
        }
    );
}