let messageHasContent = false // A mensagem tem conteúdo?
let writingMessageTimer;

messageText.addEventListener('input', (event) => {
  clearTimeout(writingMessageTimer); // Limpando o timer

  if (event.target.value.trim().length === 0) {
    messageHasContent = false
    messageImage.src = "/static/img/without-message.svg";
  } else {
    messageHasContent = true
    messageImage.src = "/static/img/with-message.svg";
  }

  typingMessage(); // O usuário x está escrevendo...

  writingMessageTimer = setTimeout(() => {
    unTypingMessage(); // O usuário x não está escrevendo...
  }, 1000);

});

const createMessages = message => {
  /*
  Adicionando novas mensagens ao chat

  message: conteúdo da mensagem
  */
  const messageBox = document.createElement("message-box");
  
  if (message.from_email.email) {
    messageBox.className = (userData.email === message.from_email.email)?"message-box me":"message-box you"
  } else {
    messageBox.className = (userData.email === message.from_email)?"message-box me":"message-box you"
  }

  const messageDate = document.createElement("span");
  messageDate.id = "message-box-date"
  messageDate.textContent = calculateDateDifference(message["created_at"]);

  const messageContent = document.createElement("p");
  messageContent.id = "message-box-content"
  messageContent.textContent = message.content;

  messageBox.appendChild(messageContent)
  messageBox.appendChild(messageDate)

  messageStudio.appendChild(messageBox)
}

const updateMessages = (data, message) => {
  /*
  Atualiza a lista de mensagens de um certo chat

  data: informações do usuário clicado | false
  message: conteúdo da nova mensagem | false
  */
  if (data) {
    let otherEmail = document.createElement("mark")
    
    if (userSelected === data.email) {
      otherEmail.textContent = "#"+data.email
      otherEmail.className = "email"

      document.querySelector('#another-painel #user-name').textContent = data.name
      document.querySelector('#another-painel #user-name').appendChild(otherEmail)
      document.querySelector('#another-painel #user-photo').src = data.photoURL
      document.querySelector(`#another-painel #state`).textContent = calculateDateLastStay(data.last_stay)
    }

    messageStudio.innerHTML = ""
    messageStudio.scrollTop = messageStudio.scrollHeight;

    if (messagesCached[data.email]) messagesCached[data.email].forEach(messageData => { createMessages(messageData) })
  } else if (message && (userSelected == message["from_email"] || userSelected == message["to_email"])) {
    messageStudio.innerHTML = ""

    if (message["from_email"] == userData.email) {
      messagesCached[message["to_email"]].forEach(messageData => { createMessages(messageData) })
    } else {
      messagesCached[message["from_email"]].forEach(messageData => { createMessages(messageData) })
    }

    messageStudio.scrollTop = messageStudio.scrollHeight;
  }
}

sendMessageElement.addEventListener('click', () => {
  if (messageHasContent) {
    sendMessage({
      'from_email': userData.email,
      'to_email': userSelected,
      'content': messageText.value
    })
  
    messageHasContent = false
    messageText.value = ""
  }
})