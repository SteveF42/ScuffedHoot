const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const db = require ('./Database/MongoDB.js')
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.engine('html', require('ejs').renderFile);
//static folder
app.set('views',path.join(__dirname,'/public/views'))

//midleware
app.use(express.json());
app.use('/',require('./routes/home.js'))
app.use('/api',require('./routes/api.js'))
app.use('/play',require('./routes/play.js'))

db.connect((err)=>{
    if(err){
        console.log('error, unable to connect to MongoDB',err)
    }
    else{
        console.log('listening on port 3000')
        server.listen(3000);
    }
})

//socketi io stuff
io.on('connection', client => {
    
})

