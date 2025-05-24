async function getTopics() {
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
  await fetch("http://localhost:3333/api/topic/all", {
    method: "GET",
    headers: {
      topicization: `Bearer ${accessToken}`,
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
    .then((topicData) => {
      console.log(topicData);
      displaytopics(topicData.topics);
    })
    .catch((error) => {
      console.log("Err: ", error);
    });
}

function displaytopics(topicsData) {
  const topicList = document.getElementById("list-topics");
  topicsData.forEach((topic) => {
    const listItem = document.createElement("div");
    listItem.textContent = `${topic.topic_title} - ${topic.topic_text}`;
    topicList.appendChild(listItem);
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
    const response = await fetch("http://localhost:3333/api/topic/refresh", {
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
