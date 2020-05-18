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
});

const addDepartment = department => {
    connection.query(
        'INSERT INTO department SET ?',
        {
            name: department
        },
        function(err) {
            if (err) throw err;

            connection.end();
        }
    );
}

module.exports = addDepartment;