const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userlist = document.getElementById('users');

const { username, room, limit } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join the room with the specified limit
socket.emit('joinRoom', { username, room, limit: parseInt(limit) });

// Get room and users info
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUser(users);
});

// Listen for messages from the server
socket.on('message', message => {
    console.log(message);

    // Check if the message indicates the room limit has been reached
    if (message.text.includes("Room limit reached")) {
        alert(message.text);
        window.location.href = "index.html"; // Redirect to the index page if the limit is reached
    } else {
        outputMessage(message);
    }
});

// Handle form submission for sending messages
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get the message from the input
    const msg = e.target.elements.msg.value;

    // Emit message to server only if not empty
    if (msg.trim()) {
        socket.emit('chatMessage', msg);

        // Clear input and focus back
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }
});

// Function to output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
    `;
    chatMessages.appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUser(users) {
    userlist.innerHTML = users.map(user => `<li>${user.username}</li>`).join('');
}

// Additional function to display room limit if needed
function outputRoomLimit(limit) {
    const roomLimitElement = document.getElementById('room-limit');
    roomLimitElement.innerText = limit;
}

// Call this function if you need to show the limit initially
outputRoomLimit(limit);
