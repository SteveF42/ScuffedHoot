const router = require('express').Router();
require('dotenv').config();
const Game = require('../Database/models/game.js');
const fetch = require('node-fetch');

router.get('/home',(req,res)=>{
    res.render('index.ejs',{title:'home'})

})

router.get('/host-game', async(req,res)=>{
    //searches the data base for quizes then sends them to the link on load
    // const results = await fetch("http://localhost:3000" + '/api/getQuestion-Queries');
    // const list = await results.json();
    // if (list.length > 10) {
    //     list = list.slice(0, 11);
    // }
    res.render('host.ejs',{title:'host game',game_info:"list"});
})

router.post('/host-game', async(req,res)=>{
    //do something to take the search queries
})


router.get('/join-game', (req,res)=>{
    
})

router.get('/create', (req,res)=>{

})
module.exports = router;