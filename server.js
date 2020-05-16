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
})

// First function to run
function init() {
    inquirer.prompt({
        type: 'list',
        name: 'firstQuestion',
        message: 'What would you like to do?',
        choices: ['View all employee\'s', 'Add new employee', 'Remove employee', 'Exit']
    }).then(function(answer) {
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