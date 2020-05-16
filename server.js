// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');

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
        choices: ['View all employee\'s', 'Add new employee', 'Remove employee', 'Exit']
     })
     .then(function(answer) {
        switch(answer.firstQuestion) {
            case 'View all employee\'s':
                viewAllEmployee();
                break;
            case 'Add new employee':
                addNewEmployee();
                break;
            case 'Remove employee':
                removeEmployee();
                break;
            default:
                console.log('See ya later!');
                connection.end();
        }
     });
}

function viewAllEmployee() {}

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
        )
     });
}

function removeEmployee() {}