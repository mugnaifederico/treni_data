const fs = require("fs");
module.exports = {
  host: "mysql-1ab6a92f-quiz-database.a.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_8E-KjOAxZZ0EgA-p6eP",
  database: "treni",
  port: 24344,
  ssl: {
    ca: fs.readFileSync("ca.pem"),
    rejectUnauthorized: true,
  },
};
