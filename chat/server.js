const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botname = "chatbot";
const PORT = process.env.PORT || 3000;

// Objects to store room limits and current user counts
const roomLimit = {};
const roomUserCounts = {};

// Run when client connects 
io.on('connection', (socket) => {
    
    // Join room
    socket.on('joinRoom', ({ username, room, limit }) => {
        // Set the room limit if it does not exist
        if (!roomLimit[room]) {
            roomLimit[room] = (limit && limit > 0) ? limit : 5; // Default limit if not provided or invalid
            roomUserCounts[room] = 0; // Initialize user count for the room
        }

        // Check the current number of users in the room
        const currentUserCount = roomUserCounts[room];

        // Check if the room is full
        if (currentUserCount >= roomLimit[room]) {
            socket.emit('message', formatMessage(botname, `Room ${room} is full. Maximum limit is ${roomLimit[room]} users.`));
            return; // Prevent user from joining if room is full
        }
        
        // Add user and join the room
        const user = userJoin(socket.id, username, room); 
        socket.join(user.room);
        roomUserCounts[user.room]++; // Increment user count

        // Welcome message to the current user
        socket.emit('message', formatMessage(botname, 'Welcome to chat, let\'s chat!'));

        // Broadcast when a new user joins (to everyone except the user)
        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} has joined the chat`));
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUser(user.room),
            limit: roomLimit[user.room],
        });

        console.log(`${user.username} joined room: ${user.room}. Current users: ${roomUserCounts[user.room]}`);
    });
    
    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
    });

    // When user leaves the chat
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if (user) {
            roomUserCounts[user.room]--; // Decrement user count

            // Prevent negative counts
            if (roomUserCounts[user.room] < 0) {
                console.warn(`Negative user count detected for room: ${user.room}`);
                roomUserCounts[user.room] = 0; // Reset to zero if it somehow goes negative
            }

            io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUser(user.room)
            });

            // Check if no users are left and clean up the room data
            if (roomUserCounts[user.room] === 0) {
                delete roomLimit[user.room];
                delete roomUserCounts[user.room];
            }

            console.log(`${user.username} left room: ${user.room}. Current users: ${roomUserCounts[user.room]}`);
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
