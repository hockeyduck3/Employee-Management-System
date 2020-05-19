DROP DATABASE IF EXISTS employee_database;

CREATE DATABASE employee_database;

USE employee_database;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL (10,2),
    department_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    PRIMARY KEY (id)
);

-- Default values that can be changed later.
INSERT INTO department (name)
VALUES ("Sales"), ("Finance"), ("Engineering"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1), ("Sales Person", 80000, 1), ("Accountant", 125000, 2), ("Lead Engineer", 150000, 3), ("Software Engineer", 125000, 3), ("Legal Team Lead", 250000, 4), ("Lawyer", 190000, 4);