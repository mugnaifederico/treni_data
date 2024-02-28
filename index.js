const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const conf = require("./conf.js");
const connection = mysql.createConnection(conf);

const http = require("http");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

server.listen(80, () => {
  console.log("server running");
});

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject();
      }
      console.log("done");
      resolve(result);
    });
  });
};

const checkLogin = (us, pw) => {
  const template = `
  SELECT * FROM admin
  WHERE username = '%username' 
  AND password = '%password'
  `;
  const sql = template.replace("%username", us).replace("%password", pw);
  return executeQuery(sql);
};

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  checkLogin(username, password).then((result) => {
    console.log(result);
    if (result.length > 0) {
      res.json({ result: "Ok" });
      console.log("si");
    } else {
      console.log("no");
      res.status(401);
      res.json({ result: "Unauthorized" });
    }
  });
});
