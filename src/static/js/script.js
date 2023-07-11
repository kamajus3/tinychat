searchBar.forEach((s) => {
  s.querySelector('input')
  .addEventListener('focus', (e) => {
    e.target.parentNode.style.borderColor = "#8b6cef"
  })
})


searchBar.forEach((s) => {
  s.querySelector('input')
  .addEventListener('blur', (e) => {
    e.target.parentNode.style.borderColor = "black"
  })
})

const calculateDateDifference = date => {
  var nowDate = moment(new Date().toISOString());
  var endDate = moment(date);

  var duration = moment.duration(nowDate.diff(endDate));

  var years = duration.years();
  var months = duration.months();
  var days = duration.days();
  var hours = duration.hours();
  var minutes = duration.minutes();
  var seconds = duration.seconds();

  var timeUnit = "";
  var value = 0;

  if (years > 0) {
    timeUnit = "y";
    value = years;
  } else if (months > 0) {
    timeUnit = "mo";
    value = months;
  } else if (days > 0) {
    timeUnit = "d";
    value = days;
  } else if (hours > 0) {
    timeUnit = "h";
    value = hours;
  } else if (minutes > 0) {
    timeUnit = "m";
    value = minutes;
  } else if (seconds > 0) {
    timeUnit = "s";
    value = seconds;
  } else {
    value = "agora"
  }

  return value + timeUnit;
}

const calculateDateLastStay = date => {
  /*
  Calcula a diferença entre a data de agora e data da última aparição de um certo usuário.
  */
  var nowDate = moment(new Date().toISOString());
  var endDate = moment(date);

  var duration = moment.duration(nowDate.diff(endDate));
  var minutes = duration.minutes();

  if (minutes >= 1) return calculateDateDifference(date)
  else return "online"
}

const updateUserStates = (user, lastStay) => {
  if (!isOtherWriting) {
    if (document.querySelector('#another-painel mark.email').textContent.replace("#", "") == user) {
      document.querySelector(`#another-painel #state`).textContent = calculateDateLastStay(lastStay)
    }
  }
}

const updateWriteState = (user, isWriting) => {
  if (document.querySelector('#another-painel mark.email').textContent.replace("#", "") == user) {
    if (isWriting) {
      document.querySelector(`#another-painel #state`).textContent = "Degitando..."
    } else {
      document.querySelector(`#another-painel #state`).textContent = "..."
    }
  }
}

const messagesClick = event => {
  /*
  Disparado quando uma mensagem for clicada

  event: Event
  */
  userSelected = `${event.target.id}@gmail.com`
  console.log(`${event.target.id}@gmail.com`)

  document.querySelector("#message-studio").innerHTML = ""
  messagesControll.style.display = 'block' 
  
  let selectedElements = document.getElementsByClassName('selected')

  if (selectedElements.length > 0) {
    for (let element of selectedElements) {
      element.classList.remove('selected')
    }
  }

  let chat = document.querySelector(`div#${event.target.id}.message`)
  chat.classList.add('selected')
  
  updateMessages({
    "name": event.target.dataset.name,
    "email": event.target.dataset.email,
    "photoURL": event.target.dataset.photoURL,
    "last_stay": event.target.dataset.last_stay
  }, false)

  if (chat.querySelector('#counter')) {
    fetch("/read_messages", {
      "method": "PUT",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": JSON.stringify({
        "users": [`${event.target.id}@gmail.com`, userData.email]
      })
    })

    chat.querySelector('#counter').remove();
  }
}

newMessage.addEventListener('click', () => { popUp.style.display = 'flex' })

userOptions.addEventListener('click', () => {
  miniPopUp.style.display = "flex"
})

popUpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (e.target.elements.email.value !== userData.email) {
    if (myFriends.includes(e.target.elements.email.value)) {
      fetch(`/chats/${userData.email}`)
      .then(data => data.json())
      .then(chats => {
        targetChat = chats.filter(item => item.user.email === e.target.elements.email.value)[0]
        document.querySelector('div#popup .message').onclick = messagesClick
        document.querySelector('div#popup .message').id = targetChat.user.email.replace('@gmail.com', '')
        document.querySelector('div#popup .message').style.display = 'flex'
        document.querySelector('div#popup > p').style.display = "none";
        document.querySelector('div#popup #user-photo').src = targetChat.user.photoURL;
        document.querySelector('div#popup #user-name').textContent = targetChat.user.name;
        
        document.querySelector('div#popup .message').dataset.name = targetChat.user.name;
        document.querySelector('div#popup .message').dataset.email = targetChat.user.email;
        document.querySelector('div#popup .message').dataset.photoURL = targetChat.user.photoURL;

        const date = document.querySelector('div#popup #date');
        const messageParagraph = document.querySelector('div#popup #content p');
        const counterSpan = document.querySelector('div#popup #counter');

        date.textContent = calculateDateDifference(targetChat.messages[targetChat.messages.length - 1]["created_at"]);
        messageParagraph.textContent = reduceChatTextContent(targetChat.messages[targetChat.messages.length - 1].content);
  
        let unreadedChatCount = 0;
        for (ct of targetChat.messages) {
          if (ct.was_readed === false && ct.from_email !== userData.email) {
            unreadedChatCount += 1;
          }
        }
        
        if (unreadedChatCount !== 0) {
          counterSpan.textContent = unreadedChatCount;
          counterSpan.style.display = "flex"
        } else {
          counterSpan.style.display = "none"
        }
      })
    } else {
      fetch(`/search/users/${e.target.elements.email.value}`)
      .then(data => {
        if (data.ok == false) {
          document.querySelector('div#popup > p').textContent = '❌ Nenhum usuário encontrado! Comece a conversar 💬'
          document.querySelector('div#popup .message').style.display = 'none'
          throw new Error('❌ Nenhum usuário encontrado! Comece a conversar 💬')
        }

        return data.json()
      })
      .then(data => {
        document.querySelector('div#popup .message').style.display = 'flex'
        document.querySelector('div#popup .message').id = data.email.replace('@gmail.com', '')
        document.querySelector('div#popup').onclick = messagesClick

        document.querySelector('div#popup #user-photo').src = data.photoURL;
        document.querySelector('div#popup #user-name').textContent = data.name;

        document.querySelector('div#popup .message').dataset.name = data.name;
        document.querySelector('div#popup .message').dataset.email = data.email;
        document.querySelector('div#popup .message').dataset.photoURL = data.photoURL;
        document.querySelector('div#popup .message').dataset.last_stay = "...";

        const messageParagraph = document.querySelector('div#popup #content p');
        const counterSpan = document.querySelector('div#popup #counter');
      
        if (data.content == "" || !messageParagraph.textContent) messageParagraph.textContent = "Óla já estou a usar o Open-chat"
        document.querySelector('div#popup > p').style.display = "none";

        counterSpan.style.display = "none"
      }).catch(error => {
        console.error('⚠️ Erro durante a requisição:', error);
      });
    }
  } else {
    document.querySelector('div#popup .message').style.display = 'none'
    document.querySelector('div#popup > p').style.display = "block";
    document.querySelector('div#popup > p').textContent = '❌ Não podes conversar consigo mesmo 💬'
    throw new Error('❌ Não podes conversar consigo mesmo 💬')
  }
});

window.addEventListener("click", event => {
  if (event.target !== popUp && event.target !== newMessage && !popUp.contains(event.target)) {
    popUp.style.display = "none";
    popUp.querySelector('.message').style.display = 'none'
    document.querySelector('div#popup input').value = ""
    document.querySelector('div#popup > p').style.display = "block";
    document.querySelector('div#popup > p').textContent = "Encontre usuários e começe a conversar 💬"
  }

  if (event.target !== miniPopUp && event.target !== userOptions) {
    miniPopUp.style.display = "none"
  }
});

setInterval(() => {
  if (userData) {
    fetch(`/users/states/${userData.email}`)
    .then(data => data.json())
    .then(users => {
      users.forEach(user => {
        userStates[user.user] = user['last_stay']
        updateUserStates([user.user], user['last_stay'])
      })
    })
  }

  tickPing();
}, 3000)