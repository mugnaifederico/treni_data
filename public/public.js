//login
const checkLogged = async (us, pw) => {
  try {
    const r = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: us,
        password: pw,
      }),
    });
    const result = await r.json();
    return result;
  } catch (e) {
    console.log(e);
  }
};

const loginBtn = document.getElementById("loginBtn");
loginBtn.onclick = () => {
  const username = document.getElementById("inputUsername").value;
  const password = document.getElementById("inputPassword").value;
  checkLogged(username, password).then((result) => {
    console.log(result);
    if (result.result == "Ok") {
      document.getElementById("inputUsername").value = "";
      document.getElementById("inputPassword").value = "";

      document.getElementById("login").style.display = "none";

      document.getElementById("querySpace").style.display = "none";

      document.getElementById("private").classList.remove("invisible");

      document.getElementById("btnQuery").classList.add("invisible");
      document.getElementById("logOut").classList.remove("invisible");
      //render
      loadData().then((result) => {
        render(result);
      });
    } else {
      document.getElementById("error").classList.remove("invisible");
      setTimeout(() => {
        document.getElementById("error").classList.add("invisible");
      }, 3000);
    }
  });
};

const logOut = document.getElementById("logOut");
logOut.onclick = () => {
  document.getElementById("login").style.display = "block";
  document.getElementById("private").classList.add("invisible");
  logOut.classList.add("invisible");
  document.getElementById("btnQuery").classList.remove("invisible");

  document.getElementById("querySpace").style.display = "block";
};

const post = async (data) => {
  try {
    const r = await fetch("/newTratta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

//modal
const buttonNewTratta = document.getElementById("newTratta");
buttonNewTratta.onclick = () => {
  const origine = document.getElementById("origine");
  const destinazione = document.getElementById("destinazione");
  const durata = document.getElementById("durata");
  const dict = {
    origine: origine.value,
    destinazione: destinazione.value,
    durata: durata.value,
  };
  console.log(dict);
  post(dict).then((result) => {
    origine.value = "";
    destinazione.value = "";
    durata.value = "HH:mm:ss";
    console.log(result);
    if (result.result == "ok") {
      document
        .getElementById("success-message-tratta")
        .classList.remove("invisible");

      setTimeout(() => {
        document
          .getElementById("success-message-tratta")
          .classList.add("invisible");
      }, 3000);
      //render
      loadData().then((result) => {
        render(result);
      });
    } else {
    }
  });
};

const load = async () => {
  try {
    const r = await fetch("/loadTratte");
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

const modalOrarioButton = document.getElementById("modalOrario");
const templateTratta = `
<button class="btn tratta" id="%id">%origine - %destinazione, %durata</button>
`;
const tratteBody = document.getElementById("tratteBody");
modalOrarioButton.onclick = () => {
  load().then((result) => {
    tratteBody.innerHTML = "";
    result.result.forEach((tratta) => {
      tratteBody.innerHTML += templateTratta
        .replace("%origine", tratta.origine)
        .replace("%destinazione", tratta.destinazione)
        .replace("%durata", tratta.durata)
        .replace("%id", tratta.id);
    });
    const buttonsTratta = document.querySelectorAll(".tratta");
    buttonsTratta.forEach((button) => {
      button.onclick = () => {
        buttonsTratta.forEach((btn) => {
          btn.classList.remove("btn-primary");
        });
        button.classList.add("btn-primary");
      };
    });
  });
};

const sendOrario = async (data) => {
  try {
    const r = await fetch("/newOrario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

const newOrario = document.getElementById("newOrario");
newOrario.onclick = () => {
  const tratta = document.querySelector(".btn.tratta.btn-primary");
  const orario = document.getElementById("orarioTratta");
  const dict = {
    tratta: tratta.id,
    orario: orario.value,
  };
  sendOrario(dict).then((result) => {
    console.log(result);
    tratta.classList.remove("btn-primary");
    orario.value = "HH:mm:ss";

    if (result.result == "ok") {
      document
        .getElementById("success-message-orario")
        .classList.remove("invisible");

      setTimeout(() => {
        document
          .getElementById("success-message-orario")
          .classList.add("invisible");
      }, 3000);
      //render
      loadData().then((result) => {
        render(result);
      });
    }
  });
};

const templateRow = `
<tr id="%id">
  <th>%id</th>
  <td>%origine</td>
  <td>%destinazione</td>
  <td>%duratah</td>
  <td>%orari</td>
</tr>
`;
const tbody = document.getElementById("tbody");

const calcOrario = (data) => {
  console.log(data);
  try {
    let splitted = String(data).split(".");
    if (splitted[0].length == 1) {
      splitted[0] = "0" + splitted[0];
    }
    if (splitted[1].length == 1) {
      splitted[1] += "0";
    }
    return splitted[0] + ":" + splitted[1];
  } catch (e) {
    console.log(e);
    return String(data);
  }
};

const render = (data) => {
  const table = document.getElementById("tableData");
  if (data) {
    table.classList.remove("invisible");
    let html = "";
    data.tratte.forEach((tratta) => {
      let listaOrari = [];
      let htmlOrari = "";
      data.orari.forEach((orario) => {
        if (orario.id_tratta == tratta.id) {
          listaOrari.push(calcOrario(orario.orario_partenza));
        }
      });
      if (listaOrari) {
        listaOrari.forEach((orario) => {
          htmlOrari += String(orario) + "<br>";
        });
      }

      html += templateRow
        .replaceAll("%id", tratta.id)
        .replace("%origine", tratta.origine)
        .replace("%destinazione", tratta.destinazione)
        .replace("%durata", tratta.durata)
        .replace("%orari", htmlOrari);
    });
    tbody.innerHTML = html;
  }
};
const loadData = async () => {
  try {
    const r = await fetch("/loadAll");
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

const btnQuery = document.getElementById("btnQuery");
btnQuery.onclick = () => {
  document.getElementById("login").style.display = "none";
  document.getElementById("querySpaceDiv").classList.remove("invisible");

  document.getElementById("btnQuery").classList.add("invisible");
  document.getElementById("back").classList.remove("invisible");
};
const back = document.getElementById("back");
back.onclick = () => {
  document.getElementById("login").style.display = "block";
  document.getElementById("querySpaceDiv").classList.add("invisible");
  document.getElementById("private").classList.add("invisible");

  document.getElementById("btnQuery").classList.remove("invisible");
  document.getElementById("back").classList.add("invisible");
};

//query
const query1 = document.getElementById("query1");
const query2 = document.getElementById("query2");
const query3 = document.getElementById("query3");

const spaceQuery1 = document.getElementById("spaceQuery1");
const spaceQuery2 = document.getElementById("spaceQuery2");
const spaceQuery3 = document.getElementById("spaceQuery3");

const sendQuery1 = async (data) => {
  try {
    const r = await fetch("/query1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

const sendQuery2 = async (data) => {
  try {
    const r = await fetch("/query2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

const sendQuery3 = async (data) => {
  try {
    const r = await fetch("/query3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};

query1.onclick = () => {
  const stazionePartenza1 = document.getElementById("stazioneInput1").value;
  const orarioPart1 = document.getElementById("orarioInput1").value;

  if (!stazionePartenza1 || !orarioPart1) {
    spaceQuery1.innerText = "Campi vuoti";
    setTimeout(() => {
      spaceQuery1.innerText = "";
    }, 3000);
  } else {
    sendQuery1({ stazione: stazionePartenza1, orario: orarioPart1 }).then(
      (result) => {
        let html = "";
        if (result.length) {
          result.forEach((element) => {
            html += element.orario_partenza + "<br>";
          });
        } else {
          html = "Nessun treno corrispondente alla ricerca";
        }

        spaceQuery1.innerHTML = html;
      },
    );
  }
};

query2.onclick = () => {
  const stazioneArr2 = document.getElementById("stazioneInput2").value;
  const orarioArr2 = document.getElementById("orarioInput2").value;

  if (!stazioneArr2 || !orarioArr2) {
    spaceQuery2.innerText = "Campi vuoti";
    setTimeout(() => {
      spaceQuery2.innerText = "";
    }, 3000);
  } else {
    sendQuery2({ stazione: stazioneArr2, orario: orarioArr2 }).then(
      (result) => {
        let html = "";
        const template = `
        Origine: %origine, Destinazione: %destinazione, Orario partenza: %orario_partenza <br>
        `;
        if (result.length) {
          result.forEach((element) => {
            html += template
              .replace("%origine", element.origine)
              .replace("%destinazione", element.destinazione)
              .replace("%orario_partenza", element.orario_partenza);
          });
        } else {
          html = "Nessun treno corrispondente alla ricerca";
        }

        spaceQuery2.innerHTML = html;
      },
    );
  }
};

query3.onclick = () => {
  const stazionePartenza3 = document.getElementById("stazionePartInput3").value;
  const stazioneArrivo3 = document.getElementById("stazioneArrInput3").value;

  if (!stazioneArrivo3 || !stazionePartenza3) {
    spaceQuery3.innerText = "Campi vuoti";
    setTimeout(() => {
      spaceQuery3.innerText = "";
    }, 3000);
  } else {
    sendQuery3({ partenza: stazionePartenza3, arrivo: stazioneArrivo3 }).then(
      (result) => {
        let html = "";
        if (result.length) {
          result.forEach((element) => {
            html += element.orario_partenza + "<br>";
          });
        } else {
          html = "Nessun treno corrispondente alla ricerca";
        }
        spaceQuery3.innerHTML = html;
      },
    );
  }
};
