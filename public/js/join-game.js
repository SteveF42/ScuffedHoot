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
    const verify = await response.json();
    console.log(verify,gamePIN)

    if (verify.message == "success") {
        socket.emit('join-game', { name: name, code: gamePIN });
        $('.container').css({'display':'none'});
    } else {
        $('.error').replaceWith(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Invalid!</strong>
            </div>
        `)
    }
})