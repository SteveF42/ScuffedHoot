const socket = io('http://localhost:3000')
const api_link = "http://localhost:3000"


document.onload = onLoad();


let audio = document.getElementById('my_audio');
// audio.play();

async function onLoad(){
    const api_req = await fetch(api_link + '/api/create-room', {
        method: "POST",
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({TITLE:TITLE})
        
    })
    const room_info = await api_req.json();
    $('#CODE').append(room_info.code)

    console.log(room_info);
    socket.emit('host-room',room_info);
    
}


socket.on('user-join',(name) => {
    console.log(`user: ${name} jas joined!`);
    $('.players').append(`
        <li class="${name}">${name}</li>
    `)

    let count = $('.player-counter').html();
    let newCount = parseInt(count[count.length-1])+1;
    console.log(count)
    $('.player-counter').replaceWith(`
        <strong class="player-counter">Players: ${newCount}</strong>
    `)
})

socket.on('player-disconnected',name=>{
    $(`.${name}`).remove()
    console.log(name,'user has left!')
})