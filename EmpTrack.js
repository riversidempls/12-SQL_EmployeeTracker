// establish package dependencies
var inquirer = require("inquirer");
var mysql = require("mysql2");
var consoleTable = require("console.table");

// setup connection paramaters for MySQL
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "2cahMySQL22!",
  database: "emptracker_db"
});

// establish connection for program to run
connection.connect(function (err) {
  if (err) {
    console.error("error connecting :" + err.stack);
    return;
  }
  console.log("connected as :" + connection.authorized);
  start();
});

// function to start main prompt
function start() {
  inquirer
    .prompt({
      name: "prompt1",
      type: "list",
      message: "Choose an option to access the database?",
      choices: ["View All Departments", "View All Roles", "View All Employees", "Add Department", "Add Role", "Add Employee", "Update Employee Roles", "exit"]
    })
    .then(function (answer) {
      var prompt1 = answer.prompt1
      switch (prompt1) {
        case "View All Employees":
          ViewAllEmployees();
          break;
        case "View All Departments":
          ViewAllDepartments();
          break;
        case "View All Roles":
          ViewAllRoles();
          break;
        case "Add Employee":
          AddEmployee();
          break;
        case "Add Department":
          AddDepartment();
          break;
        case "Add Role":
          AddRole();
          break;
        case "Update Employee Roles":
          UpdateEmployeeRoles();
          break;
        case "exit":
          console.log("exit");
          connection.end();
          break;
      }
    })
};

// functions for viewing tables

function ViewAllEmployees() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  })
};

function ViewAllDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  })
};

function ViewAllRoles() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  })
};

// functions for adding items to tables next
