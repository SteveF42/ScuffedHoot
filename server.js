const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const db = require ('./mongoDB/database.js')
const users = require('./utils/active_users.js')
const active_users = require('./utils/active_users.js')
const home = require('./routes/home.js')
const app = express();
const server = http.createServer(app);
const io = socketio(server);

db.connect((err)=>{
    if(err){
        console.log('error, unable to connect to MongoDB',err)
    }
    else{
        console.log('listening on port 3000')
        server.listen(3000);
    }
})


app.set('views',path.join(__dirname,'/public/views'))
app.engine('html', require('ejs').renderFile);

//uses static folder
app.use(express.static(path.join(__dirname,'public')))

//use home
app.use('/',home)



io.on('connection',client=>{
    console.log('New Connection!')

    // receives name for game 
    client.on('send_credentials',(name,game_id)=>{
        if(!active_users.find_id(client.id)){
            active_users.add_user(client.id,name,game_id)            
        }
    })

    client.on('leave_game',()=>{
        active_users.update_user(client.id,game_room = null)
    })
    


    // removes a user from the active_users 
    client.on('disconnect',()=>{
        console.log('Client has connected')
        active_users.remove_user(client.id)
    })

})

