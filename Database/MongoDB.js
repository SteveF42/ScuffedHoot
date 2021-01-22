const mongoose = require('mongoose');
require('dotenv').config();
// Connection URL
const url = process.env.DATABASE_URL;

options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}
 
// Database Name
const dbName = 'acme';
const state = {
    db : null
}


function connect(callback){
    if(state.db){
        callback()
    }else{
        mongoose.connect(url,options)
        const db = mongoose.connection;
        db.on('error',(err)=>{
            callback(err)
        })
        db.once('open',()=>{
            state.db = db;
            console.log('Connected to database')
            callback()
        })
    }
}

function getDB(){
    return state.db
}

function getObjectID(_id){
    return ObjectID(_id)
}

module.exports = { connect, getDB, getObjectID }