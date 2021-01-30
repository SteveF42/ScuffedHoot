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

    socket.on('host-room', async (room_info) => {
        const code = room_info.code;
        console.log('User is hosting room:', code)
        socket.join(code);

        // console.log(room_info)
    })

    socket.on('join-game', async (info) => {
        socket.join(info.code)
        io.to(info.code).emit('user-join', info.name);

        const room = await Rooms.findOne({ code: info.code });

        room.players.push({ name: info.name, socket_id: socket.id });
        await room.save();
    })

    socket.on('disconnect', async () => {
        const query = await Rooms.find({ 'players.socket_id' : socket.id })
        const room = query[0]

        if (query == null || query.length === 0) return

        const code = room.code
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
})


