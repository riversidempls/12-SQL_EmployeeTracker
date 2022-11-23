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
      choices: ["View All Departments", "View All Roles", "View All Employees", "Add Department", "Add Role",
        "Add Employee", "Update Employee Roles", "Sum Department Salary", "exit"]
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
        case "Sum Department Salary":
          SumDeptSalary();
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
function AddEmployee() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;

    // response below returns the list of roles for use in third prompt below
    res = res.map(function (role) {
      return {
        name: role.title,
        value: role.id
      }
    })
    inquirer.prompt([{
      name: "firstname",
      message: "Enter employee's first name:",
      type: "input"
    }, {
      name: "lastname",
      message: "Enter employee's last name:",
      type: "input"
    }, {
      name: "role_id",
      message: "Select the employee's role from list below:",
      type: "list",
      choices: res // list of choices here displays from res.map function that returns and renames the fields
    }])
      // after promise returns, we can use answers to populate the employee table
      .then(function (answers) {
        connection.query(`INSERT INTO employee (
              first_name, last_name, role_id
          ) VALUES (
              "${answers.firstname}", "${answers.lastname}", "${answers.role_id}"
          )`, function (err, res) {
          if (err) throw err;
          start();
        })
      })
  })
}

function AddRole() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // response below returns the list of departments for use in third prompt below
    res = res.map(function (department) {
      return {
        name: department.name,
        value: department.id
      }
    })
    inquirer.prompt([{
      name: "title",
      message: "What is the name of the role?",
      type: "input"
    }, {
      name: "salary",
      message: "What is salary is paid for this role?",
      type: "number"
    }, {
      name: "department",
      message: "Select the department for this role from the list below.",
      type: "list",
      choices: res
    }]).then(function (answers) {
      connection.query(`INSERT INTO role (title, salary, department_id) VALUES (
              "${answers.title}", "${answers.salary}", "${answers.department}")`,
        function (err, res) {
          if (err) throw err;
          start();
        })
    })
  })
}

function AddDepartment() {
  inquirer.prompt([{
    name: "name",
    message: "Enter name of the department to add:",
    type: "input"
  }]).then(function (answers) {
    connection.query(`INSERT INTO department (name) VALUES ("${answers.name}")`,
      function (err, res) {
        if (err) throw err;
        start();
      })
  })
}

//function to update existing employee

function UpdateEmployeeRoles() {
  connection.query("SELECT * FROM employee", function (err, employees) {
    if (err) throw err;
    employees = employees.map(function (employee) {
      return {
        name: employee.first_name + " " + employee.last_name,
        value: employee.id
      }
    })
    connection.query("SELECT * FROM role", function (err, roles) {
      if (err) throw err;
      roles = roles.map(function (role) {
        return {
          name: role.title,
          value: role.id
        }
      })
      inquirer.prompt([{
        name: "employee",
        message: "Select an employee to update.",
        type: "list",
        choices: employees
      }, {
        name: "role",
        message: "Select the new role.",
        type: "list",
        choices: roles
      }]).then(function (answers) {
        connection.query(`UPDATE employee SET role_id = ${answers.role} WHERE id = ${answers.employee}`, function (err, res) {
          if (err) throw err;
          start();
        })
      })
    })
  })
}

// bonus function to query department salaries and sum them!
function SumDeptSalary() {
  // first need to get a list of departments for user to select from
  connection.query("SELECT department.name, department.id FROM department;", function (err, res) {
    if (err) throw err;
    res = res.map(function (department) {
      return {
        name: department.name,
        value: department.id
      }
    })
    inquirer.prompt([{
      name: "department",
      message: "Choose a department in order see the total salary of all employees.",
      type: "list",
      choices: res
    }])
      .then(function (answers) {
        console.log(answers.department);
        connection.query(`SELECT max(department.name), sum(role.salary) 
        FROM department JOIN role
        ON department.id = role.department_id
        WHERE department.id = ${answers.department}
        GROUP BY role.department_id;`, function (err, res) {
          if (err) throw err;
          console.table(res)
          start();
        })
      })
  })
}
