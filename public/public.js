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
      document.getElementById("private").classList.remove("invisible");
      document.getElementById("private").classList.add("visible");
    } else {
      document.getElementById("error").classList.remove("invisible");
      setTimeout(() => {
        document.getElementById("error").classList.add("invisible");
      }, 3000);
    }
  });
};
