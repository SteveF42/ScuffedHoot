const api_link = "http://localhost:3000";


$('#PLAY').on('click', async () => {
    console.log('click')
    const response = await fetch(api_link + '/api/create-room', {
        method: "POST"
    })
    const room_host = await response.json();
    self.location.href = api_link + '/host?code=' + encodeURIComponent(room_host.code) + "&gameID=" + encodeURIComponent(scuffedhoot._id);
})