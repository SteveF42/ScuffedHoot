const socket = io('http://localhost:3000')

document.onload = onLoad();
let audio = document.getElementById('my_audio');
// audio.play();

function onLoad(){
    console.log(room_info);
    socket.emit('host-room',room_info.code);
    
}

socket.emit('host')