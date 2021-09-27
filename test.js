// Html element
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('valeurScore');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

// variables
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];

let questionsDone = [];


// URL parameters
let urlParams = new URLSearchParams(window.location.search);
const typeQuiz = urlParams.get("type"); // TODO : A prendre en compte pour l'URL
const MAX_QUESTIONS = urlParams.get("nbQuestions");
const practiceMode = urlParams.get("training");

// URL test
//let URL = 'http://localhost:3000/static/questions-java.json'

let URL = 'https://raw.githubusercontent.com/rocherjf/programming-language-MCQ/main/data/questions-java.json';


start();


function start() {
    fetch(
        URL
    )
        .then((res) => {
            return res.json();
        })
        .then((questionsFromJsonFile) => {

            questions = questionsFromJsonFile.map((questionFromJsonFile) => {

                let formattedQuestion = {
                    question: questionFromJsonFile.question,
                };

                // init answerChoices with incorrect answers
                let answerChoices = [...questionFromJsonFile.incorrect_answers];

                // insert the good answer at a random index (between 0 and 3)
                formattedQuestion.answer = getRandomIntInclusive(0, 3);
                answerChoices.splice(
                    formattedQuestion.answer,
                    0,
                    questionFromJsonFile.correct_answer
                );

                answerChoices.forEach((choice, index) => {
                    formattedQuestion['choice' + (index)] = choice;
                });

                return formattedQuestion;
            });

            availableQuestions = [...questions];

            initLocalStorage();
            getNewQuestionFromAvailableQuestions();
            showGame();
        })
        .catch((err) => {
            console.error(err);
        });
}

function initLocalStorage() {
    localStorage.removeItem("questionsDone");
}

//The maximum and the minimum are inclusive
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getNewQuestionFromAvailableQuestions() {

    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        localStorage.setItem('questionAnswered', questionCounter);

        return window.location.assign('result.html');
    }

    questionCounter++;

    //Update the HUD
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    // choose a random question
    const questionIndex = getRandomIntInclusive(0, availableQuestions.length - 1);
    currentQuestion = availableQuestions[questionIndex];

    question.innerHTML = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerHTML = currentQuestion['choice' + number];
        addEventListenerForThisAnswer(choice);
    });

    // remove the chosen question from available questions
    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

function addEventListenerForThisAnswer(choice) {

    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;

        if (selectedChoice.dataset['number']) {
            currentQuestion.selectedAnswer = parseInt(selectedChoice.dataset['number']);
        } else {
            currentQuestion.selectedAnswer = parseInt(selectedChoice.parentElement.dataset['number']);
        }


        if (currentQuestion.selectedAnswer === currentQuestion.answer) {
            incrementScore();
        }

        let classToApply;

        if (!practiceMode) {
            classToApply = 'select';
        } else if (practiceMode && currentQuestion.selectedAnswer === currentQuestion.answer) {
            classToApply = 'correct';
        }else{
            classToApply = 'incorrect';
        }

        selectedChoice.parentElement.classList.add(classToApply);

        let questionsDone = getQuestionsDone();
        questionsDone.push(currentQuestion);

        localStorage.setItem('questionsDone', JSON.stringify(questionsDone))

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestionFromAvailableQuestions();
        }, 1000);
    });

}



function getQuestionsDone() {
    if (!localStorage.getItem('questionsDone')) {
        return [];
    } else {
        return JSON.parse(localStorage.getItem('questionsDone'));
    }
}

function incrementScore() {
    score += 1;
    scoreText.innerText = score;
};

function showGame() {
    game.classList.remove('hidden');
    loader.classList.add('hidden');

    if (!practiceMode) {
        hudScore.classList.add('hidden');
    }
};
