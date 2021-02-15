const socket = io('http://localhost:3000')
const api_link = "http://localhost:3000"
const players = []
let playerChoiceHistory = {
    Q1:0,
    Q2:0,
    Q3:0,
    Q4:0
}
let roomID;
let roomCode;
let currentQuestion = 0;
let skipQuestion = false

document.onload = onLoad();


let audio = document.getElementById('my_audio');
// audio.play();

async function onLoad() {
    const api_req = await fetch(api_link + '/api/create-room', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ TITLE: TITLE })

    })
    const room_info = await api_req.json();
    $('#CODE').append(room_info.code)

    console.log(room_info)
    socket.emit('host-room', room_info);

    roomID = room_info._id
    roomCode = room_info.code
}

//detects when a user joins the game
socket.on('user-join', (name, socketID) => {
    console.log(`user: ${name} jas joined!`);
    $('.players').append(`
        <li class="player ${name}" name="${name}" socketid="${socketID}"> <button class="kick" type="button">${name}</button></li>
    `)
    
    players.push({
        name: name,
        score: 0,
        socketID: socketID,
    })

    const playerCounter = $('#player-counter')
    let count = parseInt(playerCounter.attr('value')) + 1
    playerCounter.html(`Players: ${count}`)
    playerCounter.attr('value', count)
})

socket.on('player-disconnected', name => {
    console.log(name, 'user has left!')
    disconnectUser(name)
})

//resets the game and returns the user back to the home screen
$(document).on('click','.return-to-home',(params) => {
    $('.game-controller').css({'display':'none'})
    $('.lobby').css({'display':'block'})
    $('body').css({'animation':'14s ease-in-out 0s infinite alternate none running color-change','background-color':'rgb(69, 163, 229)'})
    $('.endgame').css({'display':'none'})
    for(i of players){
        i.score = 0;
    }
    socket.emit('return-to-lobby',roomCode)
})

//remove player from game and emites an io event
$(document).on('click', '.kick', (event) => {
    const playerName = event.target.innerHTML
    const socketID = $(`.${playerName}`).attr('socketid')
    socket.emit('remove-player', socketID, roomID)

    console.log(socketID, roomID, playerName)
    

    console.log(players)
    disconnectUser(playerName)
})

//needs to check all responses to display the little graph thing
socket.on('receive-answer', (answer, playerName) => {
    if(answer in playerChoiceHistory){
        playerChoiceHistory[answer]+= 1
    }else{
        playerChoiceHistory[answer] = 1
    }


    const submitted = $('.submitted')
    let playersAnswered = submitted.attr('value')
    playersAnswered++;
    submitted.html(playersAnswered)
    submitted.attr('value',playersAnswered)
    
    const time = parseInt($('.timer').attr('value'))
    const question = GAME_DATA.questions[currentQuestion]
    
    //safety measure to check if the timer is 0 and the users answer is correct
    const found = players.filter(obj => obj.name === playerName)
    //use the timer as a bonus
    const bonus = Math.floor(time)
    if (time > 0 && question.correct_answer == answer) {
        if (found.length > 0) {
            const index = players.findIndex(element=>element.name===playerName)
            players[index].score += 100 + bonus;
        } else {
            players.push({
                name: playerName,
                score: 100 + bonus
            })
        }
    }
})

//updates the html 
function disconnectUser(playerName){
    const index = players.indexOf(obj=>obj.name === playerName);
    players.splice(index,1);

    $(`.${playerName}`).remove();
    const playerCounter = $('#player-counter')
    let count = parseInt(playerCounter.attr('value')) - 1
    playerCounter.html(`Players: ${count}`)
    playerCounter.attr('value', count)

}

//starts the game
$('#start').on('click', () => {
    // if()

    $('.lobby').css({ "display": "none" })

    //displays the game info
    const controller = $('.game-controller')
    controller.css({ 'display': 'flex' })
    //do something that tells new joiners if the game is in session or not

    //sets the amount of questions in the game
    $('.question-count').attr('total', GAME_DATA.question_count)

    updateGameInfo()

    console.log(GAME_DATA)
    //sends player game info
    socket.emit('start-game', roomCode, GAME_DATA.question_count)
})


$('.skip-question').on('click', (event) => {
    skipQuestion = true;
})
$(document).on('click','.display-scoreboard',(event) => {
    displayResults();
})


$(document).on('click', '.continue', () => {
    if(currentQuestion >= GAME_DATA.question_count){
        //do something that changes to the ending game screen
        $('.results').css({ 'display': 'none' })
        currentQuestion=0;
        console.log(currentQuestion)
        showEndingScreen()
    }else{
        $('.results').css({ 'display': 'none' })
        updateGameInfo()
    }
})

//main game function that displays the quetsions and the other thingies 
function updateGameInfo() {
    $('.game-body').css({ "display": "flex" })
    $('body').css({ 'animation': 'none', 'background-color': '#1e2122' })
    const responses = $('.submitted')
    responses.attr('value',0)
    responses.html('0')
    for(key in playerChoiceHistory){
        playerChoiceHistory[key]=0
    }
    
    const question = GAME_DATA.questions[currentQuestion];
    countDown(8, () => {
        const questionInfo = null
        socket.emit('send out question details', questionInfo)
        
        
        const topHalf = $('.top-half')
        const bottomHalf = $('.bottom-half')
        const footer = $('.game-footer')
        bottomHalf.find('.question-choices').html('')
        
        //sets the side timer for the current question
        
        const time = (timer) => {
            $('.timer').html(`<p>${timer}</p>`)
            $('.timer').attr('value', timer)
            timer--;
            const intervalID = setInterval(() => {
                const allResponses = responses.attr('value')
                if (timer <= 0 || allResponses >= players.length || skipQuestion) {
                    //not the best way to do this but can't think of anything else atm
                    $('.skip-question').replaceWith('<button class="display-scoreboard cstm-btn">Next</button')
                    
                    //sends the players their scores
                    //displays all of responses in a graph
                    showGraph()
                    showCorrect()
                    socket.emit('send-player-scores',roomCode,players)
                    clearInterval(intervalID)
                }
                $('.timer').html(`<p>${timer}</p>`)
                $('.timer').attr('value', timer)
                timer--;
            }, 1000)
        }
        time(60)

        topHalf.find('.ask-question').html(`<div style="display:flex; align-items:center;"><p>${question.question}</p></div>`)
        //responses will be handled by socket.io

        //displays the current questions on screen 
        let ctr = 1;
        for (key in question.answers) {
            bottomHalf.find('.question-choices').append(`
            <div class="question-${ctr} question question-box">
                <p>${question.answers[key]}</p>
            </div>`)
            ctr++;
        }

        //sets the current question in the footer
        let questionNum = parseInt(footer.find('.question-count').attr('value'));
        const total = footer.find('.question-count').attr('total');
        footer.find('.question-count').html(`
        ${questionNum}/${total}
    `)
        questionNum++;
        footer.find('.question-count').attr('value', questionNum);

        //displays room code in the footer
        footer.find('.room-code').html(`
        GamePin: ${roomCode}
    `)

    });
}

function onTimesUp(){

}

function showEndingScreen(){
    //show ending screen here
    $('.game-body').css({'display':'none'})
    $('.endgame').css({'display':'block'})
    
    const endgame = $('.endgame')
    players.sort((a,b)=>b.score - a.score)

    let ctr = 0;
    const winners = [];
    for(i of players){
        //select the top three for awarads
        if(ctr > 2) break;
        winners.push(i);
        ctr++;
    }
    endgame.html(`
        <div style="width: 100%; display:flex; justify-content:flex-end; padding: 25px 25px 0 0;">
            <button class="return-to-home cstm-btn">continue</button>
        </div>

        <div class="winners-podium text-style">
            <div class="third-place" style="display: ${winners.length > 2 ? "show" : "none"}">
                <p>${winners.length > 2 ? winners[2].name : ''}</p>
                <span class="podium">3rd place</span>
            </div>
            <div class="first-place">
                <p>${winners[0].name}</p>
                <span class="podium">1st place</span>
            </div>
            <div class="second-place" style="display: ${winners.length > 1 ? "show" : "none"}">
                <p>${winners.length > 1 ? winners[1].name : ''}</p>
                <span class="podium">2nd place</span>
            </div>
        </div>
    `)
}

function displayResults() {
    //will clear peoples games 
    $('.game-body').css({ "display": "none" })
    $('.results').css({ 'display': 'block' })
    $('body').css({ 'background-color': 'purple' })
    const scoreboard = $('.scoreboard')
    scoreboard.html('')

    // updates scoreboard html for top 5 people
    let count = 0;
    players.sort((a,b)=>b.score-a.score)
    players.forEach(obj=>{
        if(count >= 4){
            return;
        }
        count++;
        scoreboard.append(`
            <div class="scoreboard-player">
                <p class="S1 playerName">${obj.name}</p>
                <p class="S2 playerScore">${obj.score}</p>
            </div>
        `)
    })

    //continue button which goes onto the next question
    scoreboard.append(`
        <div style="display: flex; justify-content: flex-end">
            <button class="continue cstm-btn">Next</button>
        </div>
    `)
}


function showCorrect(){
    const question = GAME_DATA.questions[currentQuestion]
    currentQuestion++;

    let ctr = 1;
    for(key in question.answers){
        if(key !== question.correct_answer){
            $(`.question-${ctr}`).css({'opacity':'40%','animation':'0.5s ease 0s fade-out'})
        }
        ctr++;
    }
}

function showGraph() {
    const graph = $('.show-graph')
    //make the little graph thing that shows which people chose which answer
    const ratio = (0.75/players.length)*100
    console.log(ratio)
    graph.html(`
        <div class="graph">
        </div>
    `)

    for(key in playerChoiceHistory){
        graph.find('.graph').append(`
            <div class="bar">
                <div class="top-bar">
                    <span class="number-${key} text-style" style="font-size:40">${playerChoiceHistory[key]}</span>
                    <div class="inner-top-bar ${key}" style="height:${playerChoiceHistory[key]> 0 ? ratio * playerChoiceHistory[key] : 6}%">
                    
                    </div>
                </div>
                <div class="bottom-bar ${key}">
                    <span class="logo">

                    </span>
                </div>
            </div>
        `)
    }
}

//how much time to count down 
function countDown(count, cb) {
    $('.game-body').css({ "display": "none" })
    $('.counter-display').css({ 'display': "flex" })
    const question = GAME_DATA.questions[currentQuestion]
    $('.counter-display').html(`
        <div>
            <p class="T2">${question.question}</p> 
            <p class="T1">${count}</p> 
        </div>
    `)
    count--;
    //count down until game starts
    const timerID = setInterval(() => {
        if (count <= 0) {
            console.log('test')
            $('.game-body').css({ "display": "flex" })
            $('.counter-display').css({ 'display': "none" })
            socket.emit('allow-answers',roomCode,question)
            cb()

            clearInterval(timerID)
        }
        $('.counter-display').html(`
            <div>
                <p class="T2">${question.question}</p> 
                <p class="T1">${count}</p> 
            </div>
        `)

        count--;

    }, 1000)

}

