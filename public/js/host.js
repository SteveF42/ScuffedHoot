const socket = io('http://localhost:3000')
const api_link = "http://localhost:3000"
const players = []
let roomID;
let roomCode;
let currentQuestion = 0;

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


//remove player from game and emites an io event
$(document).on('click', '.kick', (event) => {
    const playerName = event.target.innerHTML
    const socketID = $(`.${playerName}`).attr('socketid')
    socket.emit('remove-player', socketID, roomID)

    console.log(socketID, roomID, playerName)
    disconnectUser(playerName)
})

//updates the html 
function disconnectUser(playerName){

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


$('.skip-question').on('click', () => {
    displayResults()
})


$(document).on('click', '.continue', () => {
    if(currentQuestion >= GAME_DATA.question_count){
        //do something that changes to the ending game screen
    }else{
        $('.results').css({ 'display': 'none' })
        updateGameInfo()
    }
})


function updateGameInfo() {
    $('.game-body').css({ "display": "flex" })
    $('body').css({ 'animation': 'none', 'background-color': '#1e2122' })

    allResponses = 0;
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
            timer--;
            const intervalID = setInterval(() => {
                if (timer <= 0 || allResponses >= players.length) {
                    currentQuestion++;
                    showGraph()
                    //sends the players their scores
                    socket.emit('send-player-scores',roomCode,players)

                    clearInterval(intervalID)
                }
                $('.timer').html(`<p>${timer}</p>`)
                $('.timer').attr('value', timer)
                timer--;
            }, 1000)
        }
        time(60)

        topHalf.find('.ask-question').html(`<p>${question.question}</p>`)
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

function showEndingScreen(){
    //show ending screen here
}

function displayResults() {
    //will clear peoples games 
    socket.emit('times-up')
    $('.game-body').css({ "display": "none" })
    $('.results').css({ 'display': 'block' })
    $('body').css({ 'background-color': 'purple' })
    const scoreboard = $('.scoreboard')
    scoreboard.html('')

    // updates scoreboard html for top 5 people
    let count = 0;
    players.forEach(obj=>{
        if(count >= 4){
            return;
        }
        count++;
        scoreboard.append(`
            <div class="${obj.name} scoreboard-player">
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

function showGraph() {
    const graph = $('.show-graph')
    //make the little graph thing that shows which people chose which answer
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
            socket.emit('allow-answers',roomID,question)
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

let allResponses = 0;
//needs to check all responses to display the little graph thing
socket.on('receive-answer', (answer, playerName) => {
    const time = $('.timer').attr('value')
    const question = GAME_DATA.questions[currentQuestion]

    //safety measure to check if the timer is 0 and the users answer is correct
    const found = players.filter(obj => obj.name === playerName)
    if (time > 0 && question.correct_answer == answer) {
        //use the timer as a multiplier
        const bonus = timer / 100;

        //redudent code haha brrrrrr
        if (found) {
            players.score += 100 + bonus;
        } else {
            players.push({
                name: playerName,
                score: 100 + bonus
            })
        }
    } else {
        if (found) {
            players.score += 100 + bonus;
        } else {
            players.push({
                name: playerName,
                score: 0
            })
        }
    }

    allResponses++;
})