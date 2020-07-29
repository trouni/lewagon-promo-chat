const batch = new URL(window.location.href).searchParams.get("channel") || 252; // change to your own batch id
let channel = batch;
const baseUrl = "https://wagon-chat.herokuapp.com/";

// Your turn to code!
const messages = document.querySelector("#messages");
const users = document.querySelector("#users");
const getUsers = () => document.querySelectorAll(".navbar-user");
const input = document.querySelector(".messages-panel input");
const from = document.querySelector(".navbar-user.online").innerText.trim();
const submit = document.querySelector("#comment-form input[type=submit]");
const getChannels = () => document.querySelectorAll(".navbar-channel-item");
const activeChannelName = document.querySelector(".messages-channel-name");
const batchNumbers = document.querySelectorAll(".batch-number");
// const refresh = document.getElementById("refresh");


// CHANNEL SELECTOR

const getActiveChannel = () => document.querySelector(".navbar-channel-item.active");

// DISPLAY
batchNumbers.forEach((el) => {
  el.innerText = channel;
})

// MESSAGING

const calculateTimeFromNow = date => Math.round((Date.now() - date.getTime()) / 1000 / 60);

const formatMessage = (message, author, date) => {
  const sentDate = new Date(date);
  return `<div class="message-card mb-3 d-flex">
            <img src="http://www.baytekent.com/wp-content/uploads/2016/12/facebook-default-no-profile-pic1-600x600.jpg" alt="" class="avatar rounded">
            <div class="message-card-content ml-3">
              <p class="font-weight-bold m-0">${author}</p>
              <p class="m-0">${message}</p>
            </div>
          </div>`;
};

const sortByDate = array => array.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
const filteredAuthors = (array) => {
  // array.sort((a, b) => a.author[0] - b.author[0]);
  return new Set(array.map(el => el.author));
};

const directMessage = (event) => {
  input.value = `@${event.currentTarget.innerText.trim()}: ${input.value}`;
  input.focus();
};

const refreshMessages = (event) => {
  channel = getActiveChannel().innerText.trim();
  fetch(`https://wagon-chat.herokuapp.com/${channel}/messages`)
    .then(response => response.json())
    .then((data) => {
      messages.innerHTML = "";
      sortByDate(data.messages).forEach((message) => {
        messages.innerHTML += formatMessage(message.content, message.author, message.created_at);
      });
      users.innerHTML = "";
      filteredAuthors(data.messages).forEach((author) => {
        users.innerHTML += `<li class="navbar-user online"><i class="fas fa-circle"></i> ${author}</li>`;
      });
    });
  // getUsers().forEach((user) => {
  //   user.addEventListener("click", directMessage);
  // });
  // getChannels().forEach((chan) => {
  //   chan.addEventListener("click", toggleClassActive);
  // });
};

const toggleClassActive = (event) => {
  if (activeChannelName.innerHTML !== event.currentTarget.innerHTML) {
    messages.innerHTML = "";
    getActiveChannel().classList.toggle("active");
    event.currentTarget.classList.toggle("active");
    activeChannelName.innerHTML = event.currentTarget.innerHTML;
    refreshMessages();
  }
};

const postMessage = (event) => {
  if (event.key === "Enter") {
    fetch(`https://wagon-chat.herokuapp.com/${channel}/messages`, {
      method: "POST",
      body: JSON.stringify({ author: from, content: input.value })
    })
      .then(response => response.json())
      .then((data) => {
        input.value = "";
        refreshMessages();
      })
      .catch(error => console.error('Error:', error));
  }
};


input.addEventListener("keypress", postMessage);
// users.addEventListener("click", directMessage);
getChannels().forEach((chan) => {
  chan.addEventListener("click", toggleClassActive);
});

document.addEventListener("DOMContentLoaded", () => {
  setInterval(refreshMessages, 1000);
});
