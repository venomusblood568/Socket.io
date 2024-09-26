const path = require('path');
// http = used to create web servers and handle HTTP requests and responses
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,userLeave, getRoomUser } = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botname = "chatbot";

const PORT = process.env.PORT || 3000;

// Run when client connects 
io.on('connection', (socket) => {
    
    // Join room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room); 
        socket.join(user.room);

        // Welcome message to the current user
        socket.emit('message', formatMessage(botname, 'Welcome to chat, let\'s chat!'));

        // Broadcast when a new user joins (to everyone except the user)
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botname, `${user.username} has joined the chat`));
        
        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUser(user.room)
        })    
    });
    
    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id); // Get the current user by their socket ID
        io.to(user.room).emit('message', formatMessage(user.username, msg)); // Send message to the same room
    });

    // When user leaves the chat
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if(user){
            io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users:getRoomUser(user.room)
            })  
        }
    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
