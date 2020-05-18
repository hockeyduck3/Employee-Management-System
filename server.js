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
        choices: ['View all employee\'s', 'Add new employee', 'Remove an employee', 'Exit']
     })
     .then(function(answer) {
        switch(answer.firstQuestion) {
            case 'View all employee\'s':
                viewAllEmployees();
                break;
            case 'Add new employee':
                addNewEmployee();
                break;
            case 'Remove an employee':
                removeEmployee();
                break;
            default:
                console.log('See ya later!');
                connection.end();
        }
     });
}

function viewAllEmployees() {
    connection.query(
        'SELECT * FROM employee',

        function (err, res) {
            if (err) throw err;

            var employeeArr = [];

            for(let i = 0; i < res.length; i++) {
                var employeeObj = {
                    id: res[i].id,
                    first_name: res[i].first_name,
                    last_name: res[i].last_name
                }

                employeeArr.push(employeeObj);
            }

            // Added in the line breaks before and after the table for readability
            console.log('\n')
            console.table(employeeArr)
            console.log('\n')


            init();
        }
    );
}

// Function to add employee's to the database
function addNewEmployee() {
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
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: ['John doe', 'Jane doe']
        }
    ];

    inquirer
     .prompt(questions)
     .then(function(answer) {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: 1,
                manager_id: 1
            },
            function(err) {
                if (err) throw err;

                console.log(`${answer.firstName} ${answer.lastName} has been added to the Employee database!`);

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