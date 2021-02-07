const socket = io('http://localhost:3000')
const api_link = "http://localhost:3000"
const playerScores = []
let players;
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
    players = room_info.players
    room_info.players.forEach(name => {
        playerScores.append({
            name: name,
            score: 0
        })
    })
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

    const playerCounter = $('#player-counter')
    let count = parseInt(playerCounter.attr('value')) + 1
    playerCounter.html(`Players: ${count}`)
    playerCounter.attr('value', count)
})

socket.on('player-disconnected', name => {
    $(`.${name}`).remove()
    console.log(name, 'user has left!')
})


//remove player from game
$(document).on('click', '.kick', (event) => {
    const playerName = event.target.innerHTML
    const socketID = $(`.${playerName}`).attr('socketid')

    $(`.${playerName}`).remove();
    //fire off some event that removes a player from the game 

    console.log(socketID, roomID, playerName)
    socket.emit('remove-player', socketID, roomID)

    const playerCounter = $('#player-counter')
    let count = parseInt(playerCounter.attr('value')) - 1
    playerCounter.html(`Players: ${count}`)
    playerCounter.attr('value', count)


})

$('#start').on('click', () => {
    $('.lobby').css({ "display": "none" })

    //displays the game info
    const controller = $('.game-controller')
    controller.css({ 'display': 'flex' })
    //do something that tells new joiners if the game is in session or not

    //sets the amount of questions in the game
    $('.question-count').attr('total', GAME_DATA.question_count)

    updateGameInfo()

    console.log(GAME_DATA)
    socket.emit('start-game', roomCode, GAME_DATA.question_count)
})


$('.skip-question').on('click', () => {
    //after the countdown is done it should call the callback
    // countDown(8,() => {
    //     const questionInfo = null
    //     socket.emit('send out question details',questionInfo)    
    // })

    displayResults()
})
$(document).on('click', '.continue', () => {
    $('.results').css({ 'display': 'none' })
    updateGameInfo()
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
                    clearInterval(intervalID)
                    showGraph()
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

        currentQuestion++;
    });
}

function displayResults() {
    //will clear peoples games 
    socket.emit('times-up')
    $('.game-body').css({ "display": "none" })
    $('.results').css({ 'display': 'block' })
    $('body').css({ 'background-color': 'purple' })
    const scoreboard = $('.scoreboard')
    scoreboard.html('')

    // playerScores.sort((a,b)=> playerScores[])
    for (player in playerScores) {
        scoreboard.append(`
        <div class="${player} scoreboard-player">
        <p class="S1">${player}</p>
        <p class="S2">${playerScores[player]}</p>
        </div>
        `)
    }

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
    $('.counter-display').html(`
        <div>
            <p class="T2">${GAME_DATA.questions[currentQuestion].question}</p> 
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
            cb()
            clearInterval(timerID)
        }
        $('.counter-display').html(`
            <div>
                <p class="T2">${GAME_DATA.questions[currentQuestion].question}</p> 
                <p class="T1">${count}</p> 
            </div>
        `)

        count--;

    }, 1000)

}

let allResponses = 0;
socket.on('receive-answer', (answer, playerName) => {
    const time = $('.timer').attr('value')
    const question = GAME_DATA.questions[currentQuestion]

    //safety measure to check if the timer is 0 and the users answer is correct
    const found = playerScores.filter(obj => obj.name === playerName)
    if (time > 0 && question.correct_answer == answer) {
        //use the timer as a multiplier
        const bonus = timer / 100;

        //redudent code haha brrrrrr
        if (found) {
            playerScores.score += 100 + bonus;
        } else {
            playerScores.append({
                name: playerName,
                score: 100 + bonus
            })
        }
    } else {
        if (found) {
            playerScores.score += 100 + bonus;
        } else {
            playerScores.append({
                name: playerName,
                score: 0
            })
        }
    }

    allResponses++;
})