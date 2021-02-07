let currentQuestion = 2;
let list_items = [1]
const api_link = 'http://localhost:3000'


//prevents form from defaulting a page reload
$('.create-kahoot').submit((e) => {
    e.preventDefault()
})

//submits the form and sends an api request to the database
$('#submit-form').on('click',async ()=>{
    const title = $('#title-input').val();
    const description = $('#description-input').val();
    const question_count = list_items.length;
    const category = title;
    
    const all_questions = []
    list_items.forEach(num=>{
        const element = $(`#${num}`);
        
        const correct_answer = element.find(`input[name='correct-choice${num}']:checked`).val();
        const question = element.find("#question").val()
        const answers = {}
        for(let i = 1; i <= 4; i++){
            const question = element.find(`#question-${i}`).val(); 
            answers[`Q${i}`] = question;
        }
        
        const questionObj = {
            question: question,
            correct_answer: correct_answer,
            answers: answers
        }
        all_questions.push(questionObj);
    })

    //formats it correctly
    const api_body = {
        title : title,
        description : description,
        question_count : question_count,
        category : category,
        questions: all_questions
    }
    
    try{
        const res = await fetch(api_link + '/api/sendQuestion-Queries', {
            method : 'POST',
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(api_body)
        })

        const resJson = await res.json()
        console.log(res.status)
        if(res.status== 400 || res.status === 501){
            errorMessage('Missing requirements! Please make sure everything is filled out!')
        }else{
            successMessage(`Your ScuffedHoot was successfully saved! Click<a href="/select-game/game?gameID=${resJson._id}"> here<a/> to view it!`)
            clearDOM()
        }
        
    }catch(err){
        errorMessage('An error has occurred please try again later!');
    }

    // if(){

    // }

})

// adds a new question form
$('#add-question').click(() => {


    const str = `
                <div class="question mb-3" id='${currentQuestion}'>
            
                    <label for="question">Question: ${currentQuestion}</label>
                    <div class="input-group mb-3">
                        <input id="question" type="text" class="form-control" placeholder="Question">
                        <button class="btn btn-danger test" id="remove-specific" value=${currentQuestion}>Remove</button>
                    </div>
            
                    <div id="answers" class="answers">
                        <label for="answers">Answers</label>
                        <div class="input-group mb-3" id="radio-control">
                            <input type="text" class="form-control" placeholder="Answer 1" id="question-1">
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="Q1" name="correct-choice${currentQuestion}"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 2" id="question-2">
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="Q2" name="correct-choice${currentQuestion}"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 3" id="question-3">
            
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="Q3" name="correct-choice${currentQuestion}"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 4" id="question-4">
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="Q4" name="correct-choice${currentQuestion}"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
                    </div>
                </div>
    `

    //if the first card needs to be put back it needs to check
    if(list_items.length === 0 && currentQuestion === 1){
        $(str).insertAfter('#0')
        list_items.push(currentQuestion)
        
    }else{
        $(str).insertAfter(`#${currentQuestion-1}`)
        list_items.push(currentQuestion)
        list_items.sort((a,b)=>a-b)
        console.log(list_items)
    }

    if(removed_nodes.includes(currentQuestion)){
        removed_nodes = removed_nodes.filter(num=> num !== currentQuestion)
        console.log(removed_nodes)
    }

    //checks if any node that was removed needs to be replaced, if not get the largest item in list items + 1
    currentQuestion = removed_nodes.length > 0 ? removed_nodes.reduce((a,b)=>Math.min(a,b)) : list_items[list_items.length-1] + 1;

    window.scrollBy({
        top: 15000,
        behavior: "smooth"
    })
})

let removed_nodes = []
// removes the bottom most question
$('#remove-question').click((event) => {
    const numToRemove = list_items.pop();
    console.log(list_items)
    if(numToRemove==null){
        return
    }

    $(`#${numToRemove}`).remove();

    //pushs removed node to list
    removed_nodes.push(numToRemove);
    //finds the smallest element
    currentQuestion = list_items.length > 0 ? removed_nodes.reduce((a,b)=>Math.min(a,b)) : 1;
})

//remove specific question
$(document).on('click','#remove-specific',(event) => {
    const button = event.target;
    const value = parseInt(button.value)
    $(`#${value}`).remove()

    //removes the value to be removed from active items list
    list_items = list_items.filter(num=> num !== value);
    
    //pushs removed node to list
    removed_nodes.push(value);
    currentQuestion = list_items.length > 0 ? removed_nodes.reduce((a,b)=>Math.min(a,b)) : 1;
})

const errorMessage = (msg) => {
    $('#error').html(`
    <div class="alert alert-danger" role="alert">
        ${msg}
    </div>
    `)
}

const successMessage = (msg) => {
    $('#error').html(`
    <div class="alert alert-success" role="alert">
        ${msg}
    </div>
    `)
}

const clearDOM = () => {
    $('#title-input').val('')
    $('#description-input').val('')

    
    $('.questions').replaceWith(
        `
        <div id='0'></div>
        <div class="question mb-3" id='1'>
    
            <label for="question">Question: 1</label>
            <div class="input-group mb-3">
                <input id="question" type="text" class="form-control" placeholder="Question">
                <button class="btn btn-danger" id="remove-specific" value="1">Remove</button>
            </div>
    
            <div id="answers" class="answers">
                <label for="answers">Answers</label>
                <div class="input-group mb-3" id="radio-control">
                    <input type="text" class="form-control" placeholder="Answer 1" id="question-1">
                    <div class="input-group-text">
                        <input class="form-check-input" type="radio" value="Q1" name="correct-choice1"
                            aria-label="Radio button for following text input">
                    </div>
                </div>
    
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Answer 2" id="question-2">
                    <div class="input-group-text">
                        <input class="form-check-input" type="radio" value="Q2" name="correct-choice1"
                            aria-label="Radio button for following text input">
                    </div>
                </div>
    
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Answer 3" id="question-3">
    
                    <div class="input-group-text">
                        <input class="form-check-input" type="radio" value="Q3" name="correct-choice1"
                            aria-label="Radio button for following text input">
                    </div>
                </div>
    
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Answer 4" id="question-4">
                    <div class="input-group-text">
                        <input class="form-check-input" type="radio" value="Q4" name="correct-choice1"
                            aria-label="Radio button for following text input">
                    </div>
                </div>
            </div>
        </div>
    `
    )
}