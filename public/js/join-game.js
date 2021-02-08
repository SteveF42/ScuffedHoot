const api_link = 'http://localhost:3000'
const socket = io(api_link)


document.onload = window.scroll({
    top: 100,
    behavior: "smooth"
})


$('.submit-button').on(' click',async () => {
    const name = $('#Name').val() || 'Name';
    const gamePIN = $('#Game-Pin').val() || 'gameID';

    const response = await fetch(api_link + `/api/play/${gamePIN}`);
    const roomInfo = await response.json();
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

function displayError(msg){
    $('.error').html(`
    <div class="alert alert-danger alert-dismissible fade show alert" role="alert">
        ${msg}
    </div>
`)
}

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
        <p value="0">Question: 0/${questionCount}</p>
    `)
    $('.score').html(`
        <div class="score-box">
            <p value="0">Score: 0</p>
        </div>
    `)

    $('.game-body').html(`
        <p class="text-style">Get Ready!</p>
    `)
})

socket.on('display-answer-screen',myScore=>{
    //display the users score and if the answer was correct or not
})

let isCorrect = false;
socket.on('display-questions',questionInfo=>{
    //display the questions choices and if the correct one was made
})