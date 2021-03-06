// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');
const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());

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

    console.clear();

    console.log(
        logo({
            name: 'Employee Management App',
            font: 'Standard',
            lineChars: 5,
            borderColor: 'grey',
            logoColor: 'bold-green',
            textColor: 'green',
        })
        .render()
    );

    init();
});

const fieldValidation = async input => {
    if (input.trim() === '') {
       return 'Field cannot be left blank';
    } else if (input.match(/[0-9]/g)) {
        return 'Field cannot contain numbers';
    }

    return true;
}

// Variables needed
var secondSetQuestions;
var removeVal;
var updateVal;
var viewVal;
var viewByVal;

// All the functions need for the application

// First function to run
function init() {
    inquirer
     .prompt({
        type: 'list',
        name: 'firstQuestion',
        message: 'What would you like to do?',
        choices: [
            'View', 
            'Add', 
            'Update', 
            'Remove',  
            'Exit'
        ]
     })
     .then(function(answer) {
        switch(answer.firstQuestion) {
            case 'View':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to view?',
                        choices: [
                            'View All Employees',
                            'View All Employees By Department',
                            'View All Employees By Manager',
                            'View All Departments',
                            'View All Roles',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            case 'Add':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to add?',
                        choices: [
                            'Add New Employee',
                            'Add New Department',
                            'Add New Role',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            case 'Update': 
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to update?',
                        choices: [
                            'Update Employee Role',
                            'Update Employee Manager',
                            'Back'
                        ]
                    }
                ]
                
                secondQuestion();
                break;

            case 'Remove':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to remove?',
                        choices: [
                            'Remove An Employee',
                            'Remove A Department',
                            'Remove A Role',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            default:
                console.clear()
                console.log('See ya later!');
                connection.end();
        }
     });

    // I chose to have this function nested inside of the init function
    // Only because If I had just nested another inquirer prompt inside of the first one
    // Then the exit command would not work properly
    function secondQuestion() {
        inquirer
         .prompt(secondSetQuestions)
         .then(function(answer) {
            console.clear();

            switch(answer.secondQuestion) {
                case 'View All Employees':
                    viewVal = 'employee';
                    view();
                    break;
    
                case 'View All Employees By Department':
                    viewByVal = 'department';
                    viewBy();
                    break;
    
                case 'View All Employees By Manager':
                    viewByVal = 'manager';
                    viewBy();
                    break;
    
                case 'View All Departments':
                    viewVal = 'department';
                    view();
                    break;
                
                case 'View All Roles':
                    viewVal = 'role';
                    view();
                    break;

                case 'Add New Employee':
                    addNewEmployee();
                    break;
    
                case 'Add New Department':
                    addDepartment();
                    break;

                case 'Add New Role':
                    addRole();
                    break;
    
                case 'Update Employee Role':
                    updateVal = 'role';
                    update();
                    break;
                        
                case 'Update Employee Manager':
                    updateVal = 'manager';
                    update();
                    break;
                            
                case 'Remove An Employee':
                    removeVal = 'employee';
                    remove();
                    break;

                case 'Remove A Department':
                    removeVal = 'department';
                    remove();
                    break;

                case 'Remove A Role':
                    removeVal = 'role';
                    remove();
                    break;

                default:
                    init();
            } 
         })
    }
}

// All of the view functions
function view() {
    var querySearch;

    // Check to see if the user chose employee, role, or department
    if (viewVal === 'employee') {
        querySearch = `SELECT employee.*, role.title, role.salary, department.name
        FROM employee
        INNER JOIN role 
           ON (employee.role_id = role.id)
        INNER JOIN department
           ON (role.department_id = department.id)`;
    } 

    else if (viewVal === 'role') {
        querySearch = `SELECT role.*, department.name 
        FROM role
        INNER JOIN department
           ON (department.id = role.department_id)`;
    } 
    
    else {
        querySearch = 'SELECT * FROM department';
    }

    connection.query(
        querySearch,

        function (err, res) {
            if (err) throw err;

            var tableArr = [];
        
            // I chose to run the code in a single forEach instead of having the code decide between 3 different forEach loops
            res.forEach(item => {
                // If the user chose employee
                if (viewVal === 'employee') {
                    var manager_name = null;

                    if (item.manager_id !== null) {
                        var manager_id = item.manager_id;

                        res.forEach(id => {
                            if (id.id === manager_id) {
                                manager_name = `${id.first_name} ${id.last_name}`;
                            }
                        });
                    }

                    var itemVal = {
                        id: item.id,
                        first_name: item.first_name,
                        last_name: item.last_name,
                        title: item.title,
                        department: item.name,
                        salary: item.salary,
                        manager: manager_name
                    }
                }

                // If the user chose role
                else if (viewVal === 'role') {
                    var itemVal = {
                        id: item.id,
                        title: item.title,
                        salary: item.salary,
                        department: item.name
                    }
                }

                // If the user chose department
                else {
                    var itemVal = {
                        id: item.id,
                        department_name: item.name
                    }
                }

                tableArr.push(itemVal)
            })
            
            let table = cTable.getTable(tableArr);

            console.log(`\n${table}\n`);

            init();
        }
    );
}

function viewBy() {
    var querySearch;
    var managerChoice = [];

    // This connection will run first so this way the later code has an array to reference
    connection.query(
        'SELECT * FROM employee',

        function (err, res) {
            if (err) throw err;

            res.forEach(employee => {
                var managerChoiceVal = {
                    name: `${employee.first_name} ${employee.last_name}`,
                    id: employee.id
                }

                managerChoice.push(managerChoiceVal);
            })
        }
    );

    if (viewByVal === 'manager') {
        querySearch = 'SELECT * FROM employee';
    }

    else {
        querySearch = 'SELECT * FROM department';
    }

    connection.query(
        querySearch,

        function (err, res) {
            if (err) throw err;

            var firstChoice = [];

            res.forEach(item => {
                // Check and see if the user chose to see employee's by manager
                if (viewByVal === 'manager') {
                    // Then check and see if the employee has a manager attached to their profile
                    if (item.manager_id !== null) {
                        // Loop through and see who is the employee's manager
                        res.forEach(element => {
                            if (item.manager_id === element.id) {
                                let name = `${element.first_name} ${element.last_name}`;
    
                                var firstChoiceVal = {
                                    name: name,
                                    value: {
                                        name: name,
                                        id: element.id
                                    }
                                }

                                firstChoice.push(firstChoiceVal);
                            }
                        })
                    }
                }

                else {
                    var firstChoiceVal = {
                        name: item.name,
                        value: {
                            id: item.id
                        }
                    }

                    firstChoice.push(firstChoiceVal);
                }

            });
            
            // If the firstChoice array is empty
            if (firstChoice.length === 0) {
                console.log('Doesn\'t look like you have any Employees with a Manager.\n');

                init();
            } 
            
            else {
                // Always give the user the option to cancel
                firstChoice.push('Cancel');

                // Ask which department or manager the user wants to search by
                inquirer
                 .prompt({
                    type: 'list',
                    name: 'userChoice',
                    message: `Which ${viewByVal} would you like to search by?`,
                    choices: firstChoice
                 })
                 .then(function (answer) {
                    console.clear();

                    if (answer.userChoice === 'Cancel') {
                        init();
                    }

                    else {
                        var whereVal;

                        if (viewByVal === 'manager') {
                            whereVal = {
                                manager_id: answer.userChoice.id
                            }
                        } 
                        
                        else {
                            whereVal = {
                                department_id: answer.userChoice.id
                            }
                        }

                        
                        connection.query(
                            `SELECT employee.*, role.title, role.salary, department.name
                             FROM employee
                             INNER JOIN role 
                                 ON (employee.role_id = role.id)
                             INNER JOIN department
                                 ON (role.department_id = department.id)
                             WHERE ?`,

                            whereVal,

                            function (error, results) {
                                if (error) throw error;

                                var viewByTable = [];

                                results.forEach(result => {
                                    var manager_name = null;

                                    // Run this for loop if an employee has a manager
                                    if (result.manager_id !== null) {

                                        for (let i = 0; managerChoice.length; i++) {
                                            
                                            if (result.manager_id === managerChoice[i].id) {
                                                manager_name = managerChoice[i].name;
                                                break;
                                            }
                                        }
                                    }

                                    var tableVal = {
                                        id: result.id,
                                        first_name: result.first_name,
                                        last_name: result.last_name,
                                        title: result.title,
                                        department: result.name,
                                        salary: result.salary,
                                        manager: manager_name
                                    }

                                    viewByTable.push(tableVal);
                                })

                                if (viewByTable.length !== 0) {
                                    let newTable = cTable.getTable(viewByTable);
    
                                    console.log(`${newTable}\n`);
                                } else {
                                    console.log('Sorry, but it looks like that Department doesn\'t have any employees. :(\n')
                                }

                                init();
                            }
                        );
                    }
                 })
            }
        }
    );
}

// All of the add functions
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

                console.clear();

                console.log(`${answer.firstName} ${answer.lastName} has been added to the Employee database!\n`);

                init();
            }
        );
     });
}

function addRole() {
    console.clear();

    connection.query(
        'SELECT * FROM department',

        function(err, res) {
            if (err) throw err;

            var departmentChoiceArr = [];

            res.forEach(department => {
                var departmentChoiceVal = {
                    name: department.name,
                    value: {
                        id: department.id,
                        name: department.name
                    }
                }

                departmentChoiceArr.push(departmentChoiceVal);
            });

            departmentChoiceArr.push('Cancel');

            inquirer
             .prompt({
                type: 'list',
                name: 'chosenDepartment',
                message: 'Which department would you like to add this new role to?',
                choices: departmentChoiceArr
             })
             .then(function(answer) {
                if (answer.chosenDepartment === 'Cancel') {
                    console.clear();

                    init();
                } else {
                    inquirer
                     .prompt([
                        {
                            type: 'input',
                            name: 'roleName',
                            message: 'What would you like to call this role?',
                            validate: fieldValidation    
                        },
                        {
                            type: 'input',
                            name: 'roleSalary',
                            message: 'What is the yearly salary for this role?'
                        }
                     ])
                     .then(function(roleAnswer) {
                        connection.query(
                            'INSERT INTO role SET ?',

                            {
                                title: roleAnswer.roleName,
                                salary: roleAnswer.roleSalary,
                                department_id: answer.chosenDepartment.id
                            },

                            function (err, res) {
                                if (err) throw err;

                                console.clear();

                                console.log(`${roleAnswer.roleName} has been added to the database!\n`);

                                init();
                            }
                        );
                     })
                }
             });
        }
    );
}

function addDepartment() {
    if (addVal === 'department') {
        inquirer
         .prompt({
            type: 'input',
            name: 'departmentName',
            message: 'What would you like to name this department?',
            validate: fieldValidation
         })
         .then(function(answer) {
            console.clear();
    
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answer.departmentName
                },
                function(err) {
                    if (err) throw err;
    
                    console.log(`${answer.departmentName} has been added to the database!\n`);
    
                    init();
                }
            );
         });
    }
}

// Update function
function update() {
    // Variables needed for the function
    var updateChoice = [];
    var newUpdateChoice = [];
    var roleChoicesArr = [];
    var arrayChoice;
    var promptMessage;

    // This query runs first no matter what
    // This is so that if the user chose to update the employee role
    connection.query(
        'SELECT * FROM role',

        function(error, results) {
            if (error) throw error;

            results.forEach(role => {
                var roleChoices = {
                    name: role.title,
                    value: {
                        id: role.id,
                        name: role.title
                    }
                }

                roleChoicesArr.push(roleChoices);
            });
        }
    );

    // This is the main query
    connection.query(
        `SELECT employee.*, role.title, role.department_id
         FROM employee
         INNER JOIN role 
           ON (employee.role_id = role.id)`,

        function(err, res) {
            if (err) throw err;

            // Loop through all of the employee's in the database
            res.forEach(employee => {
              let name = `${employee.first_name} ${employee.last_name}, id: ${employee.id}`;
              
              // Add all the values into the updateChoice array  
              let updateChoiceVal = {
                name: name,
                value: {
                    name: name,
                    first_name: employee.first_name,
                    name_without_id: `${employee.first_name} ${employee.last_name}`,
                    id: employee.id
                }
              }

              updateChoice.push(updateChoiceVal);
            });

            // Always give the user the option to cancel
            updateChoice.push('Cancel');

            // First inquirer question to see which employee they'd like to update. Regardless of if they chose to update role or manager.
            inquirer
             .prompt({
                type: 'list',
                name: 'userChoice',
                message: 'Which employee would you like to update?',
                choices: updateChoice
             })
             .then(function(answer) {
                //  If the user chose to cancel then clear the console and go back to the main screen
                if (answer.userChoice === 'Cancel') {
                    console.clear();

                    init();
                }

                // If the user chose to update the employee's manager
                else if (updateVal === 'manager') {
                    // Filter out the employee that the user chose to update
                    newUpdateChoice = updateChoice.filter(x => x.name !== answer.userChoice.name);

                    // Find the index of 'Cancel' and replace it with 'No one'
                    let index = newUpdateChoice.indexOf('Cancel');

                    newUpdateChoice[index] = 'No one';

                    promptMessage = `Who would you like ${answer.userChoice.first_name}'s manager to be?`;
                    
                    arrayChoice = newUpdateChoice;

                    secondUpdateQuestion();
                } 

                // If the user chose to update the employee's role
                else {
                    promptMessage = `Which position would you like ${answer.userChoice.first_name} to have?`;

                    arrayChoice = roleChoicesArr;

                    secondUpdateQuestion();
                }


                // This next inquirer prompt is within a function so this way if the user chose to cancel this inquirer prompt wouldn't run anyways.
                function secondUpdateQuestion() {
                    inquirer
                     .prompt({
                        type: 'list',
                        name: 'userSecondChoice',
                        message: promptMessage,
                        choices: arrayChoice
                     })
                     .then(function(choice) {

                        var settingChoice = [
                            {
                                id: answer.userChoice.id
                            }
                        ];

                        // If the user chose to update the employee's manager
                        if (updateVal === 'manager') {
                            settingChoice.unshift({
                                manager_id: choice.userSecondChoice.id
                            });
                        } 
                        
                        // Or if the user chose to update the employee's role
                        else {
                            settingChoice.unshift({
                                role_id: choice.userSecondChoice.id
                            });
                        }

                        // Connection query to update the employee role or manager
                        connection.query(
                            `UPDATE employee SET ? WHERE ?`,

                            settingChoice,

                            function (err, res) {
                                if (err) throw err;

                                console.clear();

                                // Depending on what the user chose, this if statement will log the appropriate response
                                if (updateVal === 'manager') {
                                    if (choice.userSecondChoice !== 'No one') {
                                        console.log(`${answer.userChoice.first_name}'s manager has been updated to ${choice.userSecondChoice.name_without_id}!\n`)
                                    } else {
                                        console.log(`${answer.userChoice.first_name}'s manager has been updated!\n`);
                                    }
                                } 
                            
                                else {
                                    console.log(`${answer.userChoice.first_name}'s position has been updated to ${choice.userSecondChoice.name}!\n`);
                                }

                                init();
                            }
                        );
                    });
                }
             });
        }
    );
}

//Remove function
function remove() {
    console.clear();

    // First query to run. This will grab all the details from either the employee table, department table, or the role table.
    connection.query(
        `SELECT * FROM ${removeVal}`,

        function (err, res) {
            if (err) throw err;

            // Empty variables to be used later
            var choiceArr = [];
            var choiceVal;

            // Depending on what the user chooses, 1 of 3 forEach loops below will run.

            // If the user chose to remove an Employee
            if (removeVal === 'employee') {
                res.forEach(employee => {
                    choiceVal = {
                        name: `${employee.first_name} ${employee.last_name}, id: ${employee.id}`,
                        value: {
                            id: employee.id,
                            name: `${employee.first_name} ${employee.last_name}`
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            } 
            
            // If the user choice to remove a department
            else if (removeVal === 'department') {
                res.forEach(department => {
                    choiceVal = {
                        name: department.name,
                        value: {
                            id: department.id,
                            name: department.name
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            }

            // If the user chose to remove a role
            else {
                res.forEach(role => {
                    choiceVal = {
                        name: role.title,
                        value: {
                            id: role.id,
                            name: role.title
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            }

            // No matter which forEach loop runs, always give the user the option to cancel.
            choiceArr.push('Cancel');

            // First inquirer prompt to ask the user which employee, department, or role they'd like to remove.
            inquirer
             .prompt({
                type: 'list',
                name: 'removeChoice',
                message: `Which ${removeVal} would you like to remove?`,
                choices: choiceArr
             })
             .then(function(answer) {
                // If the user chose to cancel, clear the console and got back to the main screen.
                if (answer.removeChoice === 'Cancel') {
                    console.clear();

                    init();
                } 
                
                else {
                    // This second inquirer prompt is a confirm screen, so the user has one last chance to decide whether to delete or not.
                    inquirer
                     .prompt({
                        type: 'confirm',
                        name: 'yesOrNo',
                        message: `Are you sure you would like to remove '${answer.removeChoice.name}' from the ${removeVal} database?`
                     })
                     .then(function(choice) {
                        // If the user chose to cancel, clear the console and run the remove function again.
                        // The remove function will still know whether the user chose employee, department, or role, and act accordingly.
                        if (choice.yesOrNo === false) {
                            console.clear();

                            remove();
                        } 
                        
                        else {
                            // If the user chose yes, then remove the item from the matching table with the matching id number.
                            connection.query(
                                `DELETE FROM ${removeVal} WHERE ?`,

                                {
                                    id: answer.removeChoice.id
                                },


                                // After that clear the console, let the user know that the item has been removed, and go back to the main screen.
                                function(error, results) {
                                    if (error) throw error;

                                    console.clear();

                                    console.log(`${answer.removeChoice.name} has been removed from the ${removeVal} database!\n`);

                                    init();
                                }
                            );
                        }
                     })
                }
             })
        }
    );
}