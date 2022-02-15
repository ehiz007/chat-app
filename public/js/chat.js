const socket = io();

const user = Qs.parse(location.search, { ignoreQueryPrefix: true });

//////dom element selected////////
const $message = document.getElementById("messages");
const $shareButton = document.querySelector("#share-location");
const $sideBar = document.querySelector("#sidebar");

///////Templates///////
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

const autoscroll = () => {
  // New message element
  const $newMessage = $message.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $message.offsetHeight;

  // Height of messages container
  const containerHeight = $message.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $message.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight;
  }
};

document.querySelector("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.input.value;
  e.target.elements.input.value = "";
  if (message) {
    socket.emit("sendMessage", message, (error) => {
      if (error) {
        return console.log(error);
      }
      console.log("sent");
    });
  }
});

document.querySelector("#share-location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation");
  }
  $shareButton.setAttribute("disabled", "disabled");
  $shareButton.textContent = "sending...";
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        user,
        long: position.coords.longitude,
        lat: position.coords.latitude,
      },
      (error) => {
        if (error) {
          setTimeout(() => (button.disabled = false), 500);
          const error = document.createElement("p");
          error.textContent = error;
          return console.log(error);
        }
        console.log("Location shared");
      }
    );
  });
});

socket.on(
  "newMessage",
  (message) => {
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.message,
      createdAt: moment(message.createdAt).format("h:mm a"),
      sender: message.type,
    });
    $message.insertAdjacentHTML("beforeend", html);
    autoscroll();
  },
  (error) => {
    if (error) {
      console.log(error);
    }
    console.log("sent");
  }
);

socket.on("sendLocation", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.location,
    createdAt: moment(location.createdAt).format("h:mm a"),
    sender: location.type,
  });
  $message.insertAdjacentHTML("beforeend", html);
  autoscroll();
  setTimeout(() => {
    $shareButton.textContent = "share location";
    $shareButton.disabled = false;
  }, 500);
});

/////add custom alert library

socket.emit("join", user, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
socket.on("join", (message) => {
  alert(message);
  location.href = "/";
});

socket.on("roomData", ({ users, room }) => {
  const html = Mustache.render(sideBarTemplate, {
    users,
    room,
  });
  $sideBar.innerHTML = html;
});

$(document).ready(function () {
  $("#btntoggle").click(function () {
    $(".paratoggle").animate({
      width: "toggle",
    });
  });
});
