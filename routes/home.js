const router = require('express').Router();
require('dotenv').config();
const Game = require('../Database/models/kahoots.js');
const Room = require('../Database/models/rooms.js');
const fetch = require('node-fetch');

router.get('/home',(req,res)=>{
    res.render('index.ejs',{title:'home'})

})

router.get('/select-game', async(req,res)=>{

    const results = await get_search_query();
    res.render('select-game.ejs',{title:'host game',search_quaries:results});
})

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
        const room_data=JSON.parse(req.query.data)
        console.log(room_data)
        
        res.render('host',{title:'home','room_data':room_data});
    }catch(err){
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