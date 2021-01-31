const router = require('express').Router();
require('dotenv').config();
const Game = require('../Database/models/kahoots.js');
const Room = require('../Database/models/rooms.js');
const fetch = require('node-fetch');
const Kahoots = require('../Database/models/kahoots.js');
const { Store, MemoryStore } = require('express-session');

router.get('/home',(req,res)=>{
    res.render('index.ejs',{title:'home'})

})

router.get('/select-game', async(req,res)=>{

    const results = await get_search_query();
    res.render('select-game.ejs',{title:'host game',search_quaries:results});
})

router.get(router.get('/select-game/game', async(req,res)=>{
    try{
        const gameID = req.query.gameID
        const result = await Kahoots.findById(gameID);
        // console.log(gameID,result)
        if(gameID == null || result == null){
            res.redirect('/home');
            return;
        }
        res.render('show-selected-game.ejs',{title:'',scuffedHoot:result});
    }catch(err){
        console.log(err)
        res.redirect('/home');
    }
}))

router.post('/select-game', async(req,res)=>{
    //do something to take the search queries

    let results = null;
    const search = req.body.input.search;
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
        const gameID = req.query.gameID;
        const game_data = await Game.findById(gameID);
        
        if(gameID == null){
            res.redirect('/home');
            return;
        }


        if(game_data == null){
            res.render('404.ejs',{title:'Not Found'});
        }
        
        res.render('host.ejs',{title:'host','game_data':game_data});
    }catch(err){
        console.log(err)
        res.redirect('/home');
    }
        
})



router.get('/join-game', (req,res)=>{

    res.render('join-game',{'title':'join-game'})
})



router.get('/create-game', (req,res)=>{
    res.render('create-game.ejs',{title:"create"})
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