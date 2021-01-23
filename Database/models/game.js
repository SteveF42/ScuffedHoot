const mongoose = require('mongoose');

const kahootSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    questions: [{
        question: {type:String, required:true},
        answers: {type:Map,of:String, required : true},
        correct_answer: {type: String, required: true}
    }]

})

module.exports = mongoose.model("kahoots", kahootSchema)