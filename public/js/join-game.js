const api_link = 'http://localhost:3000'
const socket = io(api_link)
let chosenAnswer = null
let roomInfo = null
let currentQuestion = null;

document.onload = window.scroll({
    top: 100,
    behavior: "smooth"
})

$(document).on('click','.question',(event) => {
    const button = event.target;
    chosenAnswer = button.value
    displayWaitingScreen()
    socket.emit('send-answer',roomInfo.code,chosenAnswer)
})

$('.submit-button').on(' click',async () => {
    const name = $('#Name').val() || 'Name';
    const gamePIN = $('#Game-Pin').val() || 'gameID';

    const response = await fetch(api_link + `/api/play/${gamePIN}`);
    const json = await response.json();
    
    console.log(roomInfo)
    roomInfo = {
        ...json
    }
    
    if (response.status === 200) {
        for(let i = 0; i < roomInfo.players.length; i++){
            const otherName = roomInfo.players[i].name;
            if(otherName === name){
                displayError('Name already taken!');
                return;
            }
        }
        socket.emit('join-game', { name: name, code: gamePIN });
        $('.container').css({'display':'none'});
        // insert something that says waiting for host
        
        $('.name-container').html(name)
        $('.game-controller').css({'display': 'flex'})
        

    } else {
        displayError('Invalid Code')
    }
})



socket.on('kicked', (hostDisconnect,roomCode) => {
    $('.name-container').html('');
    $('.game-controller').css({'display': 'none'});
    $('.container').css({'display' :'flex'})

    if(hostDisconnect){
        displayError('Host has disconnected!')
    }else{
        displayError('You have been kicked!')
    }

    $('.game-body').html(`
        <h2 class="text-style upper-message">You're in!</h2>
        <p class="text-style lower-message">See your nickname on screen?</p>
    `)

    socket.emit('leave-room',roomCode);
})


socket.on('start-game',(questionCount) => {
    $('.game-nav').html(`
        <p value="0" total="${questionCount}" class="question-counter">Question: 0/${questionCount}</p>
    `)
    $('.score').html(`
        <div class="score-box">
            <p class="player-points" value="0">Score: 0</p>
        </div>
    `)

    $('.game-body').html(`
        <p class="text-style">Get Ready!</p>
    `)
})

socket.on('show-results',myScore=>{
    //display the users score and if the answer was correct or not
    displayResults(myScore)
    console.log('display if user got correct answer here')
})

let isCorrect = false;
socket.on('display-questions',questionInfo=>{
    //display the questions choices and if the correct one was made
    currentQuestion = {
        ...questionInfo
    }
    chosenAnswer = null;
    console.log('display the question choices here: ',questionInfo)
    $('.game-body').css({'background-color':'rgb(29, 32, 33)'})

    updateQuestionCounter();
    displayChoices(questionInfo);
})

socket.on('reset-game',() => {
    $('.game-body').html(`
    <h2 class="text-style upper-message">Game Over!</h2>
    <p class="text-style lower-message">Your still in the game!</p>
    `)
    $('.game-body').css({'background-color':'rgb(102, 191, 57)'})
    const scoreBox = $('.player-points')
    scoreBox.attr('value',0)
    scoreBox.html(`Score: 0`)
})


function displayError(msg){
    $('.error').html(`
    <div class="alert alert-danger alert-dismissible fade show alert" role="alert">
        ${msg}
    </div>
`)
}

function updateQuestionCounter(){
    //updates the current question counter
    const questionCounter = $('.question-counter')
    const total = questionCounter.attr('total')
    let currentCount = parseInt(questionCounter.attr('value'))
    currentCount++;
    questionCounter.html(`Question: ${currentCount}/${total}`)
    questionCounter.attr('value',currentCount)

}

function displayChoices(questionInfo){
    const gameBody = $('.game-body')
    gameBody.html(`
        <div class="quiz-board">
            <div class="question-wrapper">
            </div>
        </div>
    `)

    let ctr = 1;
    for(key in questionInfo.answers){
        gameBody.find('.question-wrapper').append(`
            <button class="question question-${ctr}" value="Q${ctr}">
                <span>
                    ${ctr}
                </span>
            </button>
        `)
        ctr++;
    }
}
function displayWaitingScreen(){
    //put whatever kahoot does when you click an answer
    const gameBody = $('.game-body')

    gameBody.html(`Fast fingers or sum shit idk`)

}
function displayResults(myScore){
    //display end of quetsion results
    const gameBody = $('.game-body')
    const scoreBox = $('.player-points')
    scoreBox.attr('value',myScore)
    scoreBox.html(`Score: ${myScore}`)

        //otherwise the user did answer and needs to be told if their answer is correct
        if(chosenAnswer == currentQuestion.correct_answer){
            gameBody.css({'background-color':'green'})
            gameBody.html(`CORRECT! +${myScore}`)
        }else{
            if(chosenAnswer == null){
                gameBody.css({'background-color':'red'})
                gameBody.html(`TIMES UP LOSER!`)
            }else{
                gameBody.css({'background-color':'red'})
                gameBody.html(`INCORRECT!`)    
            }
        }
        //update user score
        //display the background if the answer was correct

}