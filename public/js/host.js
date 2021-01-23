

document.onload = get_results()


function format(title,description,question){

    
}

function send_info_to_dom(list){

    list.forEach(obj =>{
        const title = obj['title'];
        const description = obj['description'];
        const questions = obj['questions']

        $('.game-info').append(`<li>${title}, ${description}</li>`)
    })
}

async function get_results() {
    const results = await fetch("http://localhost:3000" + '/api/getQuestion-Queries');
    const list = await results.json();
    if (list.length > 10) {
        list = list.slice(0, 11);
    }
    send_info_to_dom(list);
}