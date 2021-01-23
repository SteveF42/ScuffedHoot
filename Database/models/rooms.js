const mongoose = require('mongoose');
const rand = require('random-key');
const database = require('../MongoDB.js')




const RoomSchema = new mongoose.Schema({
    code: { type: String, maxlength: 8, unique : true, required : true, default : ""},
    host: {type: String, required : true, unique: true, default : ""},
    players: [{type: String, required: true, default : []}]
})




module.exports = mongoose.model('rooms', RoomSchema);