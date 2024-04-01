const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

const handleBars = exphbs.create({ extname: ".hbs" });
app.engine("hbs", handleBars.engine);
app.set("view engine", "hbs");

const conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Durga@09",
  database: "employees", // Change to your employee database name
});

conn.getConnection((err, connection) => {
  if (err) throw err;
  console.log("MySQL connected successfully");
});

app.get("/", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    connection.query("SELECT * FROM employees", (err, rows) => {
      connection.release();
      if (!err) {
        res.render("home", { rows });
      } else {
        console.log("Error in fetching data: " + err);
      }
    });
  });
});

app.get("/addEmployee", (req, res) => {
  res.render("addEmployee");
});

app.post("/addEmployee", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    const { name, age, department, position, salary, email } = req.body;
    connection.query(
      "INSERT INTO employees (name, age, department, position, salary, email) VALUES (?, ?, ?, ?, ?, ?)",
      [name, age, department, position, salary, email],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("addEmployee", {
            msg: "Employee details added successfully",
          });
        } else {
          console.log("Error in adding employee: " + err);
        }
      }
    );
  });
});

app.get("/editEmployee/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    connection.query(
      "SELECT * FROM employees WHERE id = ?",
      [id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("editEmployee", { rows });
        } else {
          console.log("Error in fetching employee data: " + err);
        }
      }
    );
  });
});

app.post("/editEmployee/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    const { name, age, department, position, salary, email } = req.body;
    connection.query(
      "UPDATE employees SET name=?, age=?, department=?, position=?, salary=?, email=? WHERE id=?",
      [name, age, department, position, salary, email, id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("editEmployee", {
            msg: "Employee details updated successfully",
          });
        } else {
          console.log("Error in updating employee details: " + err);
        }
      }
    );
  });
});

app.get("/deleteEmployee/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    connection.query(
      "DELETE FROM employees WHERE id = ?",
      [id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.redirect("/");
        } else {
          console.log("Error in deleting employee: " + err);
        }
      }
    );
  });
});

app.listen(port, () => {
  console.log("Server running on localhost " + port);
});
