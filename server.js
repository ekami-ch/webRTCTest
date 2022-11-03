const fs = require('fs');
const key = fs.readFileSync('./cert/CA/localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./cert/CA/localhost/localhost.crt');
const express = require('express')
const app = express()
const https = require('https');
const server = https.createServer({ key, cert }, app);
var engines = require('consolidate')
const path = require("path");

const port = 3008;
server.listen(port, () => {
  console.log(`Server is listening on https://localhost:${port}`);
});
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

/*app.set('views', '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');*/

app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.sendFile(path.join(__dirname,'public', 'index.html'));
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on("message",(message)=>{
      console.log("a message !")
      socket.to(roomId).broadcast.emit("message-incoming",message)
    })
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

