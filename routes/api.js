const router = require('express').Router();
const database = require('../Database/MongoDB.js');
const Quiz = require('../Database/models/kahoots')
const Room = require('../Database/models/rooms');
const rooms = require('../Database/models/rooms');
const rand = require('random-key')
const express = require('express')



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
    console.log(req.body)

    const game = new Quiz({
        title: req.body.title,
        description: req.body.description,
        question_count: req.body.questions.length,
        category: req.body.category,
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
    try {
        await res.kahoot.remove();
        res.json({ message: "removed scuffedHoot" });
    } catch (err) {
        res.status(500).json({ message: error.message });
    }
})

router.patch('/updateQuestion-Queries/:id', getKahoot, async (req, res) => {
    if (req.body.title != null) {
        res.kahoot.title = req.body.title;
    }
    if (req.body.description != null) {
        res.kahoot.description = req.body.description;
    }
    if (req.body.questions != null) {
        res.kahoot.questions = req.body.questions;
    }
    try {
        const updatedKahoot = await res.kahoot.save();
        res.status(201).json(updatedKahoot);
    } catch (err) {
        res.status(400).json({ 'message': err.message });
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
        Responsible for creating rooms, adding players, and deleting different rooms
======================================================================
*/

//verifies the room code given
router.get('/play/:code', async (req, res) => {
    try {
        const room = await rooms.findOne({ code: req.params.code });
        // somehow need to check if a current room is in session by checking the user session
        // const host_in_session = req.session

        if (room == null) {
            res.status(404).json({ 'message': 'Room Not Found' });
        } else {
            res.status(200).json({ 'message': 'success' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.post('/create-room', async (req, res) => {

    //creates a new room for the user if user key is not found in the cookie
    if (req.session.room_key == null) {
        const Key = await generateRandomKey();
        req.session.room_key = Key;
        req.session.TITLE = req.body.TITLE

        const room = new Room({
            code: Key,
            host: req.session.id
        })
        try {
            await room.save();
            res.status(201).json(room);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }else{
        //returns an already existing room
        try {
            const current_room = await Room.findOne({"host" : req.session.id})
            if(req.session.TITLE === null || req.session.TITLE != req.body.TITLE){
                current_room.code = await generateRandomKey()
                
                req.session.TITLE = req.body.TITLE
                req.session.room_key = current_room.code
                
                current_room.save()
            }
            
            console.log(req.session.TITLE,req.body.TITLE)
            // const Key = await generateRandomKey();
            // current_room.code = Key;

            // await current_room.save();
            res.status(201).json(current_room);
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: err.message });
        }
    }
})

//adds user to room information OUTDATED
router.post('/play/:code', async (req, res) => {
    try {
        const room = await Room.findOne({ code: req.params.code });
        room.players.push(req.body.name);
        await room.save();
        res.status(205).json(room);
    } catch (err) {
        res.status(400).json({ "message": err.message });
    }
})

//generates random key for room
async function generateRandomKey() {
    const length = 8;
    const db = database.getDB();
    let key = "";
    while (true) {
        key = rand.generate(length).toUpperCase();
        const lst = await db.collection('rooms').find({ 'code': key }).toArray();
        if (lst.length == 0) {
            break;
        }
    }
    return key;
}

module.exports = router;