
const api_link = "http://localhost:3000"

document.onload = send_info_to_dom()

//when the user selects a game
$('.choose-game').on('click',async(event)=>{
    try{
        const button = event.target;
        const title = button.innerHTML;
        const gameID = { gameID : button.name, title : title};
        console.log(gameID)
        self.location.href=(api_link+'/select-game/game?data='+encodeURIComponent(JSON.stringify(gameID)))
    }catch(err){
        console.log(err)
    }
})


function send_info_to_dom(){
    console.log(search_quaries)
    if(typeof(search_quaries) !== 'object'){
        return;
    }else if(search_quaries.notFound){
        $('.col2').append("No results found")
        console.log('Not Found')
        return
    }


    search_quaries.forEach(obj =>{
        const title = obj['title'];
        const description = obj['description'];
        const question_count = obj['question_count'];
        const game_id = obj['_id'];

        console.log(description, question_count);

        $('.col2').append(
        `<div class="game-info-container">
            <div class="game-title">
                <h5>
                    <button class="choose-game" name ="${game_id}">${title}</button> 
                </h5>
            </div>
            <p class="game-info">
                ${description}<br>
                question count: ${question_count} <br>
                GameID: ${game_id}<br>
                test<br>
                test<br>
            </p>
        </div>`);
    })
}

// async function get_results() {
//     const results = await fetch("http://localhost:3000" + '/api/getQuestion-Queries');
//     const list = await results.json();
//     if (list.length > 10) {
//         list = list.slice(0, 11);
//     }
//     send_info_to_dom(list);
// }