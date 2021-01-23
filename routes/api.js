const router = require('express').Router();
const database = require('../Database/MongoDB.js');
const Quiz = require('../Database/models/game')
const Room = require('../Database/models/rooms');
const rooms = require('../Database/models/rooms');
const rand = require('random-key')



/*
======================================================================
    Scuffed Hoot API which stores all of the available tests, whatever you call them
======================================================================
*/


//gets all kahoots
router.get('/getQuestion-Queries', async (req, res) => {
    try {
        const curser = await Quiz.find();
        // const curser = await db.collection('Kahoot').find().toArray();
        // console.log(curser)
        res.json(curser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

//queries a kahoot by id
router.get('/getQuestion-Queries/:id', getKahoot, async (req, res) => {
    res.send(res.kahoot)
})

//inserts a quiz
router.post('/sendQuestion-Queries', async (req, res) => {

    const game = new Quiz({
        title: req.body.title,
        description: req.body.description,
        question_count: req.body.questions.length,
        questions: req.body.questions
    })
    try {
        const newKahoot = await game.save();
        res.status(201).json(newKahoot);
    } catch (err) {
        res.status(501).json({ message: err.message })
    }
})

router.delete('/deleteQuestion-Queries/:id', getKahoot, async (req, res) => {
    try{
        await res.kahoot.remove();
        res.json({message : "removed scuffedHoot"});
    }catch(err){
        res.status(500).json({message : error.message});
    }
})

router.patch('/updateQuestion-Queries/:id', getKahoot, async(req,res) =>{
    if(req.body.title != null){
        res.kahoot.title = req.body.title;
    }
    if(req.body.description != null){
        res.kahoot.description = req.body.description;
    }
    if(req.body.questions != null){
        res.kahoot.questions = req.body.questions;
    }
    try{
        const updatedKahoot = await res.kahoot.save();
        res.status(201).json(updatedKahoot);
    }catch(err){
        res.status(400).json({'message':err.message});
    }
})


async function getKahoot(req, res, next) {
    let kahoot;
    try {
        kahoot = await Quiz.findById(req.params.id);
        if (kahoot == null) {
            return res.status(404).json({ message: 'Not Found' });
        }
    } catch (err) {
        return res.status(405).json({ message: 'invalid ID length' });
    }

    res.kahoot = kahoot;
    next();
}


/*
======================================================================
        Responsible for creating, adding players, and deleting different rooms
======================================================================
*/

//send the client the room information
router.get('/play/:code', async (req,res)=>{
    try{
        const room = await rooms.findOne({code : req.params.code});
        if(room == null){
            res.status(404).json({'message' : 'Room Not Found'});
        }else{
            res.status(200).json(room);
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
})

router.post('/host', async (req,res) =>{
    const Key = await generateRandomKey();
    const room = new Room({
        code : Key,
        host : req.session.id
    })
    try{
        await room.save();
        res.status(201).json(room);
    }catch(err){
        res.status(500).json({message : err.message});
    }
})

router.post('/play/:code', async(req,res)=>{
    try{
        const room = await Room.findOne({code : req.params.code});
        room.players.push(req.body.name);
        await room.save();
        res.status(205).json(room);
    }catch(err){
        res.status(400).json({"message" : err.message});
    }
})

//generates random key for room
async function generateRandomKey() {
    const length = 8;
    const db = database.getDB();
    let key = "";
    while(true){
        key = rand.generate(length).toUpperCase();
        const lst = await db.collection('rooms').find({'code' : key}).toArray();
        if(lst.length == 0){
            break;
        }
    }
    return key;
}

module.exports = router;