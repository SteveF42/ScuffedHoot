const router = require('express').Router();


router.get('/home',(req,res)=>{
    res.render('home.html',{'name':'steve'})

})

router.get('/create', (req,res)=>{

})

router.get('/start-game', (req,res)=>{
    
})

router.get('/join-game', (req,res)=>{
    
})

module.exports = router;