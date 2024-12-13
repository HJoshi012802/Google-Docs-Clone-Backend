const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Document =require("./Model/Document.js")

dotenv.config();

app.use(cors({
    origin:"*",
    credentials: true,
}))

const mongodb_url = process.env.MONGODB_URL;
const defaultValue = ""

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

    socket.on('send-documentId',async(documentId)=>{
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document',document.data);

        socket.on("send-quill-changes",delta =>{
            console.log(delta);
            socket.broadcast.to(documentId).emit("recive-quill-changes",delta);
        })

        socket.on("save-document",async (document)=>{
           await Document.findByIdAndUpdate(documentId,{document})
        })
    })
    
    socket.on("disconnect",()=>{
    console.log("DISCONNECTED FROM CLIENT !!! :" ,socket.id);
   })
 })

  server.listen(6069, () => {
    console.log('Server is running on port 6069');
    connect_to_db(mongodb_url);
  });

 

  async function connect_to_db(mongodb_url){
    try{
      await  mongoose.connect(mongodb_url).then(()=>{
        console.log("Connected to MongoDB");
      })
    }
    catch(error){
      console.log('Error in Connecting to the Database:', error);
    }
  }


  async function findOrCreateDocument(id){
    if(id == null) return;

    const document = await Document.findById(id)
    if(document) return document

    return await Document.create({_id: id, data: defaultValue})
  }