const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
    code: { type: String, maxlength: 8, unique : true, required : true, default : ""},
    host: {type: String, required : true},
    players: [{type: String, required: true, default : []}]
})




module.exports = mongoose.model('rooms', RoomSchema);