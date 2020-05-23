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

var secondSetQuestions;

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
                    viewAllEmployees();
                    break;
    
                case 'View All Employees By Department':
                    employeesByDepartment();
                    break;
    
                case 'View All Employees By Manager':
                    employeesByManager();
                    break;
    
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                
                case 'View All Roles':
                    viewAllRoles();
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
                    updateEmployeeRole()
                    break;
                        
                case 'Update Employee Manager':
                    updateEmployeeManager();
                    break;
                            
                case 'Remove An Employee':
                    removeEmployee();
                    break;

                case 'Remove A Department':
                    removeDepartment();
                    break;

                case 'Remove A Role':
                    removeRole();
                    break;

                default:
                    init();
            } 
         })
    }
}

function viewAllEmployees() {
    connection.query(
        `SELECT employee.*, role.title, role.salary, department.name
         FROM employee
         INNER JOIN role 
            ON (employee.role_id = role.id)
         INNER JOIN department
            ON (role.department_id = department.id)`,

        function (err, res) {
            if (err) throw err;

            var employeeArr = [];

            res.forEach(element => {
                var manager_name = null;

                if (element.manager_id !== null) {
                    var manager_id = element.manager_id;

                    res.forEach(id => {
                        if (id.id === manager_id) {
                            manager_name = `${id.first_name} ${id.last_name}`;
                        }
                    });
                }

                let employeeVal = {
                    id: element.id,
                    first_name: element.first_name,
                    last_name: element.last_name,
                    title: element.title,
                    department: element.name,
                    salary: element.salary,
                    manager: manager_name
                }

                employeeArr.push(employeeVal);
            });

            let employeeTable = cTable.getTable(employeeArr);

            // Added in the line breaks before and after the table for readability
            console.table(`\n${employeeTable}\n`);

            init();
        }
    );
}

function viewAllDepartments() {
}

function viewAllRoles() {
}

function employeesByDepartment() {
    connection.query(
        'SELECT * FROM department',

        function(err, res) {
            if (err) throw err;

            inquirer
             .prompt({
                type: 'list',
                name: 'departmentName',
                message: 'Which department would you like?',
                choices: function() {
                    var departmentChoice = [];

                    res.forEach(item => {
                        var departmentVal = {
                            name: item.name,
                            value: {
                                department_id: item.id
                            }
                        }

                        departmentChoice.push(departmentVal);

                    });

                    departmentChoice.push('Cancel');

                    return departmentChoice;
                }
             })
             .then(function(answer) {
                var employeeManagerArr = [];

                console.clear()
                
                if (answer.departmentName === 'Cancel') {
                    init();
                } else {
                    
                    // This connection query will run first to make sure the code below will have an array to reference
                    // Just in case if one of the employee's manager is not null
                    connection.query(
                        'SELECT * FROM employee',
    
                        function(err, res) {
                            if (err) throw err;
    
                            res.forEach(item => {
                                var employeeManagerVal = {
                                    id: item.id,
                                    name: `${item.first_name} ${item.last_name}`
                                }
    
                                employeeManagerArr.push(employeeManagerVal);
                            });
                        }
                    );
    
                    connection.query(
                        `SELECT employee.*, role.title, role.salary, department.name
                         FROM employee
                         INNER JOIN role 
                            ON (employee.role_id = role.id)
                         INNER JOIN department
                            ON (role.department_id = department.id)
                         WHERE ?`,
    
                        {
                            department_id: answer.departmentName.department_id
                        },
    
                        function (err, res) {
                            if (err) throw err;
    
                            var byDepartmentArr = [];
            
                            res.forEach(item => {
                                var byDepartmentManager_name = null;
                                if (item.manager_id !== null) {
    
                                    // Loop through the array above and check to see which employee id matches the manager id
                                    for (let i = 0; i < employeeManagerArr.length; i++) {
                                        if (item.manager_id === employeeManagerArr[i].id) {
                                            byDepartmentManager_name = employeeManagerArr[i].name;
                                            break;
                                        }
                                    }
                                }
    
                                byDepartmentArr.push({
                                    id: item.id,
                                    first_name: item.first_name,
                                    last_name: item.last_name,
                                    title: item.title,
                                    department: item.name,
                                    salary: item.salary,
                                    manager: byDepartmentManager_name
                                });
                            });
    
                            if (byDepartmentArr.length !== 0) {
                                let departmentTable = cTable.getTable(byDepartmentArr);
    
                                console.log(`${departmentTable}\n`);
                            } else {
                                console.log('Sorry, but it looks like that Department doesn\'t have any employees. :(\n')
                            }
    
                            init();
                        }
                    );
                }
             });

        }
    );
}

function employeesByManager() {
    connection.query(
        `SELECT employee.*, role.title, role.salary, department.name
         FROM employee
         INNER JOIN role 
            ON (employee.role_id = role.id)
         INNER JOIN department
            ON (role.department_id = department.id)`,

        function(err, res) {
            if (err) throw err;

            var managerChoicesArr = [];

            res.forEach(item => {
                if (item.manager_id !== null) {
                    res.forEach(element => {
                        if (item.manager_id === element.id) {
                            let name = `${element.first_name} ${element.last_name}`;

                            var managerChoicesVal = {
                                name: name,
                                value: {
                                    name: name,
                                    id: element.id
                                }
                            }

                            managerChoicesArr.push(managerChoicesVal);
                        }
                    })
                }
            });

            if (managerChoicesArr.length === 0) {
                console.log('\nDoesn\'t look like you have any Employees with a Manager.\n');

                init();
            } else {
                managerChoicesArr.push('Cancel');
                
                inquirer
                 .prompt({
                     type: 'list',
                     name: 'managerPick',
                     message: 'Which manager would you like to search by?',
                     choices: managerChoicesArr
                 })
                 .then(function(response) {
                    console.clear();

                    if (response.managerPick === 'Cancel') {
                        init();
                    } else {
                        connection.query(
                            `SELECT employee.*, role.title, role.salary, department.name
                             FROM employee
                             INNER JOIN role 
                                 ON (employee.role_id = role.id)
                             INNER JOIN department
                                 ON (role.department_id = department.id)
                             WHERE ?`, 

                            {
                                manager_id: response.managerPick.id
                            },

                            function (err, res) {
                                if (err) throw err;

                                var results = [];

                                res.forEach(employee => {
                                    var resultsVal = {
                                        id: employee.id,
                                        first_name: employee.first_name,
                                        last_name: employee.last_name,
                                        title: employee.title,
                                        department: employee.name,
                                        salary: employee.salary,
                                        manager: response.managerPick.name
                                    }

                                    results.push(resultsVal);
                                });

                                let employeesByManagerTable = cTable.getTable(results);

                                console.log(`\n${employeesByManagerTable}`);

                                init();
                            }
                        );
                    }
                });
            }
        }
    );
}

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

function addDepartment() {
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

function addRole() {
}

function updateEmployeeManager() {
    connection.query(
        'SELECT * FROM employee',

        function(err, res) {
            if (err) throw err;

            var employeeUpdateChoice = [];

            res.forEach(employee => {
              let name = `${employee.first_name} ${employee.last_name}, id: ${employee.id}`;
              
              let employeeUpdateVal = {
                name: name,
                value: {
                    name: name,
                    first_name: employee.first_name,
                    name_without_id: `${employee.first_name} ${employee.last_name}`,
                    id: employee.id
                }
              }

              employeeUpdateChoice.push(employeeUpdateVal);
            });

            employeeUpdateChoice.push('Cancel');

            inquirer
             .prompt({
                type: 'list',
                name: 'employeeToUpdate',
                message: 'Which Employee would you like to update?',
                choices: employeeUpdateChoice
             }).then(function(firstAnswer) {
                if (firstAnswer.employeeToUpdate === 'Cancel') {
                    console.clear();
                    init();
                } else {
                    inquirer
                     .prompt({
                         type: 'list',
                         name: 'managerChoice',
                         message: `Who would you like ${firstAnswer.employeeToUpdate.first_name}'s manager to be?`,
                         choices: function() {
                            let newChoice = employeeUpdateChoice.filter(x => x.name !== firstAnswer.employeeToUpdate.name);

                            let index = newChoice.indexOf('Cancel');

                            newChoice[index] = 'No one';

                            return newChoice
                         }
                     }).then(function(secondAnswer) {
                        connection.query(
                            'UPDATE employee SET ? WHERE ?',
                            [
                                {
                                    manager_id: secondAnswer.managerChoice.id
                                },
                                {
                                    id: firstAnswer.employeeToUpdate.id
                                }
                            ],

                            function(err, res) {
                                if (err) throw err;

                                console.clear();

                                if (secondAnswer.managerChoice !== 'No one') {
                                    console.log(`${firstAnswer.employeeToUpdate.first_name}'s manager has been updated to ${secondAnswer.managerChoice.name_without_id}!\n`)
                                } else {
                                    console.log(`${firstAnswer.employeeToUpdate.first_name}'s manager has been updated!\n`);
                                }

                                init();
                            }
                        );
                     })
                }
             });
        }
    );
}

function updateEmployeeRole() {
    connection.query(
        `SELECT employee.*, role.title, role.department_id
         FROM employee
         INNER JOIN role 
           ON (employee.role_id = role.id)`,

        function(err, res) {
            if (err) throw err;

            var employeeUpdateChoice = [];

            res.forEach(employee => {
                let name = `${employee.first_name} ${employee.last_name}, id: ${employee.id}`;
              
                let employeeUpdateVal = {
                    name: name,
                    value: {
                        name: name,
                        first_name: employee.first_name,
                        id: employee.id,
                    }
                }

                employeeUpdateChoice.push(employeeUpdateVal);
            });

            employeeUpdateChoice.push('Cancel');

            inquirer
             .prompt({
                type: 'list',
                name: 'employee',
                message: 'Which employee would you like to update?',
                choices: employeeUpdateChoice
             }).then(function(response) {
                connection.query(
                    'SELECT * FROM role',

                    function(err, res) {
                        if (err) throw err;

                        var positionArr = [];

                        res.forEach(position => {
                            var positionVal = {
                                name: position.title,
                                value: {
                                    id: position.id,
                                    position_name: position.title
                                }
                            }

                            positionArr.push(positionVal);
                        });

                        inquirer
                         .prompt({
                            type: 'list',
                            name: 'positionChoice',
                            message: `Which position would you like ${response.employee.first_name} to have?`,
                            choices: positionArr
                         })
                         .then(function(answer) {
                            console.log(answer)

                            connection.query(
                                'UPDATE employee SET ? WHERE ?',

                                [
                                    {
                                        role_id: answer.positionChoice.id
                                    },
                                    {
                                        id: response.employee.id
                                    }
                                ],

                                function (err, res) {
                                    if (err) throw err;

                                    console.clear();

                                    console.log(`${response.employee.first_name}'s position has been updated to ${answer.positionChoice.position_name}!\n`);

                                    init();
                                }
                            );
                         })
                    }
                );
             })
        }
    );
}

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
                    name: `${res[i].first_name} ${res[i].last_name} id: ${res[i].id}`,
                    value: {
                        id: res[i].id,
                        name: `${res[i].first_name} ${res[i].last_name}`
                    }
                };

                choiceArr.push(choiceVal);
            }

            choiceArr.push('Cancel');

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

                if (answer.removeEmployee === 'Cancel') {
                    console.clear();
                    init();
                } else {
                    inquirer
                     .prompt({
                        type: 'confirm',
                        name: 'areYouSure',
                        message: `Are you sure you'd like to delete ${employeeName} from the database?`
                     }).then(function(trueOrFalse) {
                        console.clear();

                        if (trueOrFalse.areYouSure) {
                            connection.query(
                                'DELETE FROM employee WHERE ?',
            
                                {
                                    id: id
                                },
            
                                function (err) {
                                    if (err) throw err;
            
                                    console.log(`${employeeName} has been removed from the database!\n`);
            
                                    init();
                                }
                            );
                        } else {
                            removeEmployee();
                        }
                     });
                }
             });
        }
    );
}

function removeDepartment() {
}

function removeRole() {
}