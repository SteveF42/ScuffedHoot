const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID; 
// Connection URL
const url = 'mongodb://localhost:27017';

options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}
 
// Database Name
const dbName = 'scuffedHoot';
 
const state = {
    db : null
}

function connect(callback){
    if(state.db){
        callback()
    }else{
        MongoClient.connect(url,options,(err,client)=>{
            if(err){
                console.log('Error connecting')
                callback(err)
            }
            else{
                state.db = client.db(dbName);
                console.log('Connected to DB')
                callback()
            }
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