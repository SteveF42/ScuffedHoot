const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const db = require ('./Database/MongoDB.js')
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const session = require('express-session');
require('dotenv').config();

//view engine either of the two options work
// app.engine('html5',require('ejs').renderFile);
app.set('view engine', 'ejs')

//static folder and views folder
app.use(express.static('public'))
app.set('views',path.join(__dirname,'/public/views'))

//midleware
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    duration: 30*60*1000,
    activeDuration: 5*60*1000

}));
app.use('/',require('./routes/home.js'));
app.use('/api',require('./routes/api.js'));
app.use('/play',require('./routes/play.js'));

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

