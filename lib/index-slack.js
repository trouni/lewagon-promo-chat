const baseUrl = "https://wagon-chat.herokuapp.com/";

// Your turn to code!
let authors = []
let messages = []
let channel = new URL(window.location.href).searchParams.get("channel")
let name = new URL(window.location.href).searchParams.get("name")
document.getElementById("username").value = name
const messagesDiv = document.getElementById("messages");
const authorsDiv = document.getElementById("users");
const input = document.getElementById("message-input");
const getChannels = () => document.querySelectorAll(".navbar-channel-item, #users .navbar-user");
const getActiveChannel = () => document.querySelector(".navbar-channel-item.active, #users .navbar-user.active");

const formatMessage = (message, author, date) => {
  const sentDate = new Date(date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  return `<div class="message-card mb-3 d-flex">
            <img src="http://www.baytekent.com/wp-content/uploads/2016/12/facebook-default-no-profile-pic1-600x600.jpg" alt="" class="avatar rounded">
            <div class="message-card-content ml-3">
              <p class="m-0"><span class="font-weight-bold">${author}</span> <span class="ml-1 small underline-hover text-secondary">${sentDate}</span></p>
              <p class="m-0">${message}</p>
            </div>
          </div>`;
};

const sortByDate = array => array.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const pushToArray = (array, element) => {
  const elementIndex = array.findIndex(e => e === element);
  if (elementIndex === -1) {
    array.push(element);
  }
}

const refreshMessages = (forChannel) => {
  if (!channel) return

  const url = `https://wagon-chat.herokuapp.com/${forChannel}/messages`
  fetch(url)
    .then(response => response.json())
    .then((data) => {
      const newMessages = data.messages.filter(message => messages.findIndex(e => e.id === message.id) === -1);
      const newAuthors = new Set(newMessages.map(e => e.author).filter(author => authors.findIndex(e => e === author) === -1))
      // Prevent and older fetch from resolving after a channel change.
      if (forChannel === channel) {
        if (newMessages.length > 0) {
          if (messagesDiv.innerHTML === "Loading...") messagesDiv.innerHTML = ''
          sortByDate(newMessages).forEach((message) => {
            pushToArray(authors, message.author)
            messagesDiv.insertAdjacentHTML('beforeEnd', formatMessage(message.content, message.author, message.created_at));
          });
          document.querySelector('#messages .message-card:last-child').scrollIntoView()
          newMessages.forEach((message) => pushToArray(messages, message))
          
          newAuthors.forEach((author) => {
            const authorElement = document.createElement('li')
            authorElement.className = 'navbar-user online'
            authorElement.innerHTML = `<i class="fas fa-circle"></i> ${author}`
            authorElement.addEventListener("click", toggleClassActive);
            authorsDiv.insertAdjacentElement('beforeEnd', authorElement);
          });
        } else {
          if (messagesDiv.innerHTML === "Loading...") messagesDiv.innerHTML = 'No messages in this channel.'
        }
      }
  });
};

const resetChannel = () => {
  messages = []
  messagesDiv.innerHTML = "Loading...";
  refreshMessages(channel);
}

const setMainChannel = () => {
  channel = document.getElementById('batch-number').value || channel
  document.querySelectorAll(".batch-number").forEach((el) => {
    el.innerText = channel;
    el.value = channel;
  })
  resetChannel()
}

const makePrivateChannelName = (name1, name2) => {
  names = [name1, name2].sort()
  return names[0] + names[1]
}

const toggleClassActive = (event) => {
  const channelNameElement = document.querySelector(".messages-channel-name");
  const newChannel = event.currentTarget
  if (channelNameElement.innerHTML !== newChannel.innerHTML) {
    const previousChannel = getActiveChannel()
    const newChannelName = newChannel.innerText.trim()
    channelNameElement.innerHTML = newChannel.innerHTML;
    name = document.querySelector("#username").value
    channel = newChannel.classList.contains('navbar-user') ? makePrivateChannelName(name, newChannelName) : newChannelName;
    previousChannel.classList.toggle("active");
    newChannel.classList.toggle("active");
    resetChannel()
  }
};

const postMessage = (event) => {
  if (!channel || !name) return

  if (event.key === "Enter") {
    name = document.querySelector("#username").value;
    fetch(`https://wagon-chat.herokuapp.com/${channel}/messages`, {
      method: "POST",
      body: JSON.stringify({ author: name, content: input.value })
    })
      .then(response => response.json())
      .then((data) => {
        input.value = "";
        refreshMessages(channel);
      })
      .catch(error => console.error('Error:', error));
  }
};

const initialize = () => {
  input.addEventListener("keypress", postMessage);

  getChannels().forEach((chan) => {
    chan.addEventListener("click", toggleClassActive);
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => refreshMessages(channel), 1000);
  });
  
  setMainChannel()
  document.getElementById('batch-number').addEventListener('change', setMainChannel)
}

initialize()