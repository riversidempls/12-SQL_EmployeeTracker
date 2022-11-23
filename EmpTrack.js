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

function start() {
  inquirer
    .prompt({
      name: "EMS",
      type: "list",
      message: "What would you like to do?",
      choices: ["View All Departments", "View All Roles", "View All Employees", "Add Department", "Add Role", "Add Employee", "Update Employee Roles", "exit"]
    })
};