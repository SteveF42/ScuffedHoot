const router = require('express').Router();
const database = require('../Database/MongoDB.js');
const Quiz = require('../Database/models/game')

//gets all kahoots
router.get('/getQuestion-Queries', async (req, res) => {
    try {
        const curser = await Quiz.find();
        // const curser = await db.collection('Kahoot').find().toArray();
        console.log(curser)
        res.json(curser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

//queries a kahoot by id
router.get('/getQuestion-Queries/:id', async (req, res) =>{
    try {
        const curser = await Quiz.find({_id : req.params.id});
        // const curser = await db.collection('Kahoot').find().toArray();
        console.log(curser)
        res.json(curser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

//inserts a quiz
router.post('/sendQuestion-Queries', async (req, res) => {

    const game = new Quiz({
        title: req.body.title,
        description: req.body.description,
        questions: req.body.questions
    })
    try {
        const newKahoot = await game.save();
        res.status(201).json(newKahoot);
    } catch (err) {
        res.status(501).json({ message: err.message })
    }
})



module.exports = router;