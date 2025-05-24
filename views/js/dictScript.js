async function getDicts() {
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
  await fetch("http://localhost:3333/api/dict/all", {
    method: "GET",
    headers: {
      dictization: `Bearer ${accessToken}`,
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
    .then((dictData) => {
      console.log(dictData);
      displaydicts(dictData.dicts);
    })
    .catch((error) => {
      console.log("Err: ", error);
    });
}

function displaydicts(dictsData) {
  const dictList = document.getElementById("list-dicts");
  dictsData.forEach((dict) => {
    const listItem = document.createElement("div");
    listItem.textContent = `${dict.term} - ${dict.letter}`;
    dictList.appendChild(listItem);
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
  try {
    const response = await fetch("http://localhost:3333/api/dict/refresh", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resdata = await response.json();

    if (resdata.error && resdata.error == "jwt expired") {
      console.log("RefreshTokenning vaqti chiqib ketdi");
    }

    console.log("Tokenlar refreshToken yordamida yangilandi");
    localStorage.setItem("accessToken", resdata.accessToken);
    return resdata.accessToken;
  } catch (error) {
    console.log("Err: ", error);
  }
}
