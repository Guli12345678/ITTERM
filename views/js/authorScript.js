async function login() {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await fetch("http://localhost:3333/api/author/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Login successfully");
            return response.json();
          } else {
            console.log("Login failed");
          }
        })
        .then((datas) => {
          console.log(datas);
          localStorage.setItem("accessToken", datas.accessToken);
        });
    } catch (error) {
      console.log(error);
    }
  });
}

async function getAuthors() {
  let accessToken = localStorage.getItem("accessToken");
  console.log(accessToken);
  const accessTokenExpTime = getTokenExpTime(accessToken);
  // console.log("accesstokenexp", accessTokenExpTime);

  if (accessTokenExpTime) {
    const currentTime = new Date();
    if (currentTime < accessTokenExpTime) {
      console.log("Access token faol");
    } else {
      console.log("AccessToken vaqti chiqib ketti");
      accessToken = await refreshToken();
    }
  } else {
    console.log("AccessToken chiqish vaqti berilmagan!");
  }
  await fetch("http://localhost:3333/api/author/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log("Request failed with status: ", response.status);
      }
    })
    .then((authorData) => {
      console.log(authorData);
      displayAuthors(authorData.authors);
    })
    .catch((error) => {
      console.log("Err: ", error);
    });
}

function displayAuthors(authorsData) {
  const authorList = document.getElementById("list-authors");
  authorsData.forEach((author) => {
    const listItem = document.createElement("div");
    listItem.textContent = `${author.first_name} ${author.last_name} - ${author.email}`;
    authorList.appendChild(listItem);
  });
  return;
}

function getTokenExpTime(token) {
  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    console.log(decodedToken);
    if (decodedToken.exp) {
      return new Date(decodedToken.exp * 1000);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

async function refreshToken() {
  const loginUrl = "/login";
  try {
    const response = await fetch("http://localhost:3333/api/author/refresh", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resdata = await response.json();

    if (resdata.error && resdata.error == "jwt expired") {
      console.log("RefreshTokenning vaqti chiqib ketdi");
      return window.location.replace(loginUrl);
    }

    console.log("Tokenlar refreshToken yordamida yangilandi");
    localStorage.setItem("accessToken", resdata.accessToken);
    return resdata.accessToken;
  } catch (error) {
    console.log("Err: ", error);
  }
}
