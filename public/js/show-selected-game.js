const api_link = "http://localhost:3000";


$('#PLAY').on('click', async () => {
    self.location.href = api_link + `/host?gameID=${scuffedhoot._id}`;
})