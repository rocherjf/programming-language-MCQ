// Html element
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('answer-text'));
const next = document.getElementById('next-container');
let currentResult = 0;


init();
start();


function init() {
    next.addEventListener('click', (e) => {
        start();
    });
}

function start() {

    let currentQuestion = getNextAnswer();

    question.innerHTML = currentQuestion.question;

    choices.forEach((choice) => {
        const number = parseInt(choice.dataset['number']);
        choice.innerHTML = currentQuestion['choice' + number];

        choice.parentElement.classList.remove('correct');
        choice.parentElement.classList.remove('incorrect');
        if(currentQuestion.selectedAnswer === number){
            if(currentQuestion.answer === number){
                choice.parentElement.classList.add('correct');
            }else{
                choice.parentElement.classList.add('incorrect');
            }
        }

        if(currentQuestion.answer === number){
            choice.parentElement.classList.add('correct');
        }
        
    });

    if(isThereNoMoreResult()){
        next.innerText = 'RESULT'
        next.removeEventListener('click', (e) => {
            start();
        });
        next.addEventListener('click', (e) => {
            return window.location.assign('result.html');
        });
    }
}

function isThereNoMoreResult(){
    if(!localStorage.getItem('questionsDone')){
        return  true;
    }else{
        return JSON.parse(localStorage.getItem('questionsDone')).length <= currentResult;
    }
}


function getNextAnswer(){
    let answer = JSON.parse(localStorage.getItem('questionsDone'))[currentResult];
    currentResult++;
    return answer;
}
