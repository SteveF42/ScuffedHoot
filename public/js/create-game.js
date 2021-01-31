let currentQuestion = 2;
let list_items = [1]


$('.create-kahoot').submit((e) => {
    e.preventDefault()
})

//submits the form and sends an api request to the database
$('#submit-form').on('click',()=>{
    for(let i = 1; i <= currentQuestion; i++){

    }

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
                                <input class="form-check-input" type="radio" value="" name="correct-choice"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 2" id="question-2">
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="" name="correct-choice"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 3" id="question-3">
            
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="" name="correct-choice"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
            
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Answer 4" id="question-4">
                            <div class="input-group-text">
                                <input class="form-check-input" type="radio" value="" name="correct-choice"
                                    aria-label="Radio button for following text input">
                            </div>
                        </div>
                    </div>
                </div>
    `

    if(list_items.length === 0 && currentQuestion === 1){
        $(str).insertAfter('.questions')
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

    while(true){
        const element = $(`#${currentQuestion}`).get()
        if(element.length === 0){
            break;
        }
        currentQuestion += 1
    }

    window.scrollBy({
        top: 15000,
        behavior: "smooth"
    })

    // while(true){
    //     const element = $(`#${currentQuestion}`).get()
    //     console.log(element)
    //     if(element.length === 0){
    //         break;
    //     }
    //     currentQuestion += 1
    // }
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
    removed_nodes.push(numToRemove);
    //finds the smallest element
    
    console.log('removed_nodes',removed_nodes)
    currentQuestion = list_items.length > 0 ? removed_nodes.reduce((a,b)=>Math.min(a,b)) : 1;
    console.log('currentQuestion',currentQuestion)
})

//remove specific question
$(document).on('click','#remove-specific',(event) => {
    const button = event.target;
    const value = parseInt(button.value)
    $(`#${value}`).remove()

    list_items = list_items.filter(num=> num !== value);
    
    removed_nodes.push(value);
    console.log('removed_nodes',removed_nodes)
    currentQuestion = list_items.length > 0 ? removed_nodes.reduce((a,b)=>Math.min(a,b)) : 1;
    console.log('currentQuestion',currentQuestion)
})