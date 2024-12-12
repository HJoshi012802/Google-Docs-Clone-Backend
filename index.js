const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


app.use(cors({
    origin:"*",
    credentials: true,
}))


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: "true",
    methods: ["GET", "POST"],
  }
});

app.get('/', (req, res) => {
    res.send("Welcome to the Google Docs Clone Server with Socket + Express made by HARSHIT  JOSHI");
  });


 io.on("connection",(socket) =>{
    console.log("CONNECTION FROM CLIENT !!! :" ,socket.id);

    socket.on('send-documentId',(documentId)=>{
        const data = ""
        socket.join(documentId);
        socket.emit('load-document',data);
        socket.on("send-quill-changes",delta =>{
            console.log(delta);
            socket.broadcast.to(documentId).emit("recive-quill-changes",delta);
        })
    })
    
    socket.on("disconnect",()=>{
    console.log("DISCONNECTED FROM CLIENT !!! :" ,socket.id);
   })
 })

  server.listen(6069, () => {
    console.log('Server is running on port 6069');
  });