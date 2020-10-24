const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    console.log(req.query)
    res.render('home.html',{'name':req.query.username  || "temp"})
})

router.post('/',(req,res)=>{
    console.log(req.body)
    res.redirect('http://localhost:3000')
})

router.get('/start-game',(req,res)=>{
    res.render('start_game.html')
})

router.get('/create-quiz',(req,res)=>{

})

router.get('/join-game',(req,res)=>{
    
})
module.exports = router;