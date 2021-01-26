const router = require('express').Router();
require('dotenv').config();
const Game = require('../Database/models/kahoots.js');
const Room = require('../Database/models/rooms.js');
const fetch = require('node-fetch');
const kahoots = require('../Database/models/kahoots.js');

router.get('/home',(req,res)=>{
    res.render('index.ejs',{title:'home'})

})

router.get('/select-game', async(req,res)=>{

    const results = await get_search_query();
    res.render('select-game.ejs',{title:'host game',search_quaries:results});
})

router.get(router.get('/select-game/game', async(req,res)=>{
    try{
        const search_quaries = JSON.parse(req.query.data);
        const result = await kahoots.findById(search_quaries.gameID);
        if(search_quaries == null || result == null){
            res.redirect('/home');
            return;
        }
        res.render('show-selected-game.ejs',{title:search_quaries.title,scuffedHoot:result});
    }catch(err){
        res.redirect('/home');
    }
}))

router.post('/select-game', async(req,res)=>{
    //do something to take the search queries

    let results = null;
    const search = req.body.input.search;
    console.log(search)
    try{
        if(req.body.input.search !== ''){
            results = await Game.find({$or: [{'title':search},{'category':search}]})
        }else{
            results = await Game.find();
        }
        if(results.length == 0){
            results = {
                notFound : true
            }
        }
        res.render('select-game.ejs',{title:"host game",search_quaries:results})
    }catch{
        res.render('select-game.ejs',{title:"host game",search_quaries:''})
    }
})

router.get('/host', async(req,res)=>{
    // const room_valid = await fetch(process.env.URL_LINK + '/api/')
    
    try{
        // const game_data = JSON.parse(req.query.game)
        const room_code = req.query.code;
        const gameID = req.query.gameID;
        if(req.session.room_key != room_code){
            res.redirect('/home');
            return;
        }

        const room_data = await Room.findOne({code:room_code});
        const game_data = await Game.findById(gameID);

        if(room_data == null || game_data == null){
            res.render('404.ejs',{title:'Not Found'});
        }
        
        res.render('host.ejs',{title:'host','room_data':room_data,'game_data':game_data});
    }catch(err){
        console.log(err)
        res.redirect('/home');
    }
        
})



router.get('/join-game', (req,res)=>{
    
})

router.get('/create', (req,res)=>{

})


async function get_search_query(query) {
    let results;
    if(query != null){
        results = await Game.find(query);

    }else{
        results = await Game.find();
    }

    return results;
}

module.exports = router;