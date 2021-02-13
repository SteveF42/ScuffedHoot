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
    roomInfo = {
        ...json
    }

    console.log(roomInfo)

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

        $('.name-container').append(name)
        $('.game-controller').css({'display': 'flex'})


    } else {
        displayError('Invalid Code')
    }
})



socket.on('kicked', (hostDisconnect,roomCode) => {
    $('.name').html('');
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

//gamebody-background
// background-image: initial;
//     background-color: rgb(23, 25, 26);
//     flex-direction: column;
//     background: rgb(255, 255, 255);
//     flex: 1 0 0%;
//     overflow: hidden auto;
//     width: 100%;
//goes with gamebody-background
// display: flex;
//     flex-direction: column;
//     background: rgb(255, 255, 255);
//     flex: 1 0 0%;
//     overflow: hidden auto;
//     width: 100%;

//quiz-board
//question box container
//     display: flex;
//     flex: 1 1 0%;
//     flex-flow: column wrap;
//     box-sizing: border-box;

//question wrapper
//     display: flex;
//     flex: 1 0 auto;
//     flex-flow: row wrap;


//each question-box
// border-color: initial;
//     box-shadow: rgb(0 0 0 / 10%) 0px -3px inset;
//     -webkit-tap-highlight-color: transparent;
//     background-color: rgb(172, 21, 46);
// }

// <style>
// .hwmhKZ {
//     border-color: initial;
//     background-image: initial;
//     background-color: rgb(14, 79, 157);
//     color: rgb(220, 219, 216);
//     text-decoration-color: initial;
// }
// <style>
// .fapcry {
//     display: flex;
//     flex: 0 1 auto;
//     flex-direction: row;
//     -webkit-box-align: center;
//     align-items: center;
//     -webkit-box-pack: center;
//     justify-content: center;
//     width: calc(50% - 16px);
//     max-width: 100%;
//     margin: 8px;
//     border: 0px;
//     border-radius: 3px;
//     box-shadow: rgb(0 0 0 / 10%) 0px -3px inset;
//     -webkit-tap-highlight-color: transparent;
//     transition: transform 0.1s linear 0s;
//     position: relative;
//     background-color: rgb(226, 27, 60);