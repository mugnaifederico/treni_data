const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const conf = require("./conf1.js");
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
    if (result.length > 0) {
      res.json({ result: "Ok" });
    } else {
      res.status(401);
      res.json({ result: "Unauthorized" });
    }
  });
});

const select_tratte = () => {
  const sql = `
  SELECT * FROM tratta`;
  return executeQuery(sql);
};

const select_orari = () => {
  const sql = `
  SELECT * FROM orario`;
  return executeQuery(sql);
};

const createTratta = (data) => {
  const template = `
  INSERT INTO tratta (origine, destinazione, durata)
  VALUES ('%origine', '%destinazione', '%durata')
  `;
  const durata = String(data.durata);
  const sql = template
    .replace("%origine", data.origine)
    .replace("%destinazione", data.destinazione)
    .replace("%durata", durata.split(":")[0] + "." + durata.split(":")[1]);
  return executeQuery(sql);
};

const update = (data) => {
  const durata = String(data.durata);
  const sql = `
  UPDATE tratta 
  SET durata = '${durata.split(":")[0] + "." + durata.split(":")[1]}'
  WHERE origine = '${data.origine}'
  AND destinazione = '${data.destinazione}'
  `;
  return executeQuery(sql);
};

app.post("/newTratta", (req, res) => {
  console.log(req.body);
  const reqOrigine = req.body.origine;
  const reqDestinazione = req.body.destinazione;
  select_tratte().then((result) => {
    let find = false;
    if (result.length) {
      result.forEach((row) => {
        if (row.origine == reqOrigine && row.destinazione == reqDestinazione) {
          console.log("esiste già:", row.id);
          find = true;
          update(req.body).then((result) => {
            console.log(result);
          });
        }
      });
      if (!find) {
        createTratta(req.body).then((result) => {
          console.log(result);
        });
      }
    } else {
      createTratta(req.body).then((result) => {
        console.log(result);
      });
    }
  });
  res.json({ result: "ok" });
});

const createOrario = (data) => {
  const orario = String(data.orario);
  const sql = `
  INSERT INTO orario(orario_partenza, id_tratta)
  VALUES ('${orario.split(":")[0] + "." + orario.split(":")[1]}', '${
    data.tratta
  }')
  `;
  return executeQuery(sql);
};

app.post("/newOrario", (req, res) => {
  createOrario(req.body).then((result) => {
    console.log(result);
    res.json({ result: "ok" });
  });
});

app.get("/loadTratte", (req, res) => {
  select_tratte().then((result) => {
    res.json({ result: result });
  });
});

app.get("/loadAll", (req, res) => {
  select_tratte().then((tratte_res) => {
    select_orari().then((orari_res) => {
      res.json({ tratte: tratte_res, orari: orari_res });
    });
  });
});

//Treni in partenza da una certa stazione ad un certo orario: indica tutti i treni che partono da quella stazione a partire da quell’orario.
/*const ciao = `
  SELECT tratta.origine, tratta.destinazione, tratta.durata, orario.orario_partenza
  FROM tratta, orario
  WHERE tratta.origine = '${data.stazione}'
  AND tratta.id = orario.id_tratta
  AND orario.orario_partenza = ${
    orario.split(":")[0] + "." + orario.split(":")[1]
  }
  `;*/

const query1 = (data) => {
  const orario = String(data.orario);
  const sql = `
  SELECT tratta.origine, tratta.destinazione, tratta.durata, orario.orario_partenza
  FROM tratta, orario
  WHERE tratta.origine = '${data.stazione}'
  AND tratta.id = orario.id_tratta
  AND orario.orario_partenza >= ${
    orario.split(":")[0] + "." + orario.split(":")[1]
  }
  `;
  console.log(sql);
  return executeQuery(sql);
};

const query2 = (data) => {
  const orario = String(data.orario);
  const sql = `
  SELECT tratta.origine, tratta.destinazione, tratta.durata, orario.orario_partenza
  FROM tratta, orario
  WHERE tratta.destinazione = '${data.stazione}'
  AND tratta.id = orario.id_tratta
  AND orario.orario_partenza >= ${
    orario.split(":")[0] + "." + orario.split(":")[1]
  } - tratta.durata
  `;
  console.log(sql);
  return executeQuery(sql);
};

const query3 = (data) => {
  const sql = `
  SELECT tratta.origine, tratta.destinazione, orario.orario_partenza
  FROM tratta, orario
  WHERE tratta.origine = '${data.partenza}'
  AND tratta.destinazione = '${data.arrivo}'
  AND tratta.id = orario.id_tratta
  `;
  return executeQuery(sql);
};

app.post("/query1", (req, res) => {
  query1(req.body).then((result) => {
    console.log(result);
    res.json(result);
  });
});

app.post("/query2", (req, res) => {
  query2(req.body).then((result) => {
    console.log(result);
    res.json(result);
  });
});

app.post("/query3", (req, res) => {
  query3(req.body).then((result) => {
    console.log(result);
    res.json(result);
  });
});
