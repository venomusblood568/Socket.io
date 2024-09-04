const http = require("http");
const express = require("express");
const path = require("path");
const {Server} = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = new Server(server);

//socket.io
io.on("connection",(socket)=>{
    // for if of socket
    console.log("A new user has connected",socket.id);
    // for printing console in terminal
    socket.on("user-message",(message) => {
        console.log("A new User Message", message);
        io.emit("message",message);
    });
});


app.use(express.static(path.resolve("./public")));

app.get("/", (req,res) => {
    return res.sendFile('/public/index.html');
})

server.listen(9000,() => console.log('server started at port 9000'));