const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const db = require('./Database/MongoDB.js')
const mongoose = require('mongoose')
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const bodyParser = require('body-parser')
const session = require('express-session');
const Rooms = require('./Database/models/rooms.js')
const MongoStore = require('connect-mongo')(session);

require('dotenv').config();


db.connect(async (err) => {
    if (err) {
        console.log('error, unable to connect to MongoDB', err)
    }
    else {
        console.log('listening on port 3000')
        server.listen(3000, '0.0.0.0');
    }
})

//view engine either of the two options work
// app.engine('html5',require('ejs').renderFile);
app.set('view engine', 'ejs')

//static folder and views folder
app.use(express.static('public'))
app.set('views', path.join(__dirname, '/public/views'))

//midleware
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    duration: 120 * 60 * 1000,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    })
}));
app.use('/', require('./routes/home.js'));
app.use('/api', require('./routes/api.js'));
app.use('/play', require('./routes/play.js'));
app.use((req, res) => {
    res.render('404.ejs', { title: '404' });
});


//socketi io stuff handles users connecting to rooms
io.on('connection', socket => {
    
    //creates a room that the host connects to
    socket.on('host-room', async (room_info) => {
        const code = room_info.code;
        const roomId = room_info._id

        const room = await Rooms.findById(roomId);
        room.host_socket = socket.id;
        await room.save();

        console.log('User is hosting room:', code)
        socket.join(code);

        // console.log(room_info)
    })
    //disconnects user from room
    socket.on('leave-room',(roomCode) => {
        const rooms = socket.rooms
        socket.leave(roomCode)
    })

    //removes player from room
    socket.on('remove-player', async(socketID,roomID) => {
        const room = await Rooms.findById(roomID);

        room.players = room.players.filter(obj=>obj.socket_id != socketID);
        socket.broadcast.to(socketID).emit('kicked',null,room.code)

        const res = await room.save()
    })
    //when a user connects to a host
    socket.on('join-game', async (info) => {
        socket.join(info.code)
        io.to(info.code).emit('user-join', info.name,socket.id);

        const room = await Rooms.findOne({ code: info.code });

        room.players.push({ name: info.name, socket_id: socket.id });
        await room.save();
    })
    //when a user disconnects randomly checks if its the host or a player
    socket.on('disconnect', async () => {
        const query = await Rooms.find({$or:[{ 'players.socket_id' : socket.id }, {'host_socket' : socket.id}]})
        const room = query[0]
        
        if (query == null || query.length === 0) return
        
        const code = room.code
        if (socket.id === room.host_socket) {
            room.players = []
            socket.broadcast.to(code).emit('kicked',hostDisconnect=true,code)
            room.save()

            return;
        }


        let player_name;

        // finds the players name and removes them from the array
        const new_arr = room.players.filter(obj => {
            if(obj.socket_id === socket.id){
                player_name = obj.name;
                return false;
            }
            return true
        })

        console.log(new_arr)

        room.players = new_arr;
        await room.save()
        io.to(code).emit('player-disconnected', player_name)

    })
    //sends game info to each individual player such as question count, and question choices
    socket.on('start-game',(code,questionCount) => {
        console.log(code,questionCount)
        socket.to(code).emit('start-game',questionCount)
    })
    //wtf does this do lmao
    socket.on('game-session',(code) => {
        socket.to(code).emit('game-info')
    })
    //sends event to host when a player submittes an answer
    socket.on('send-answer', async(code,answer) => {
        const room = await Rooms.findOne({'socket_id':socket.id})
        const player = room.players.filter(obj=> obj.socket_id === socket.id)
        
        //sends the chosen answer from the player to the host 
        socket.to(room.host_socket).emit('receive-answer',answer,player.name)
    })

    //at the end of every question it'll send an event to the players telling them what their score was
    socket.on('send-player-scores',(room,players) => {
        players.forEach((obj) => {
            socket.to(obj.socketID).emit('display-answer-screen',obj.score)
        })
    })
    //allows players to select answers
    socket.on('allow-answers',(code,question)=>{
        socket.broadcast.to(code).emit('display-questions',question)
    })
})


