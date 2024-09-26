const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userlist = document.getElementById('users');
 
const{username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

const socket = io();

//joing the room
socket.emit('joinRoom',{username,room});

//get room and users info
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUser(users);
})


// Listen for messages from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Handle form submission for sending messages
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get the message from the input
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input and focus back
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Function to output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username }  <span>${ message.time}</span></p>
                     <p class="text">${message.text}</p>`;
    chatMessages.appendChild(div);

    // Scroll down to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//add users to DOM
function outputUser(users){
    userlist.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}