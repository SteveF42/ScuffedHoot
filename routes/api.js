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
router.get('/getQuestion-Queries/:id', getKahoot, async (req, res) => {
    res.send(res.kahoot)
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

module.exports = router;