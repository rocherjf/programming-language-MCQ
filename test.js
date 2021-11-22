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
const typeQuiz = urlParams.get("type");
const MAX_QUESTIONS = urlParams.get("nbQuestions") || 10;
const practiceMode = urlParams.get("training") || true;

// URL test
//let URL = "http://localhost:3000/static/questions-java.json"

let URL = getURLDocumentQuestion();


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

function getURLDocumentQuestion() {

    let URL;

    switch (typeQuiz) {
        case "Java":
            URL = 'data/java.json';
            break;
        case "JavaCleanCode":
            URL = 'data/java-clean-code-practice.json';
            break;
        case "JavaAppSec":
            URL = 'data/java-application-security.json';
            break;
        case "JavaWebAppSec":
            URL = 'data/java-web-application-security.json';
            break;
        case "JavaParadigmProgamming":
            URL = 'data/java-paradigm-programming.json';
            break;
        case "JavaTesting":
            URL = 'data/java-testing.json';
            break;
        case "Spring":
            URL = 'data/spring-core.json';
            break;
        case "Javascript":
            URL = 'data/javascript.json';
            break;
        case "Html":
            URL = 'data/html.json';
            break;
        case "HtmlJsCss":
            URL = 'data/html-js-css.json';
            break;
        case "SpringWebAppService":
            URL = 'data/spring-web-app-service.json';
            break;
        case "SpringSecurity":
            URL = 'data/spring-security.json';
            break;
        case "jsRestApi":
            URL = 'data/js-rest-api.json';
            break;
        default:
            URL = 'data/java.json';
    }

    return URL;
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

        // TODO : simplify ...
        let answerHTMLElement;
        if (selectedChoice.dataset['number']) {
            answerHTMLElement = selectedChoice;
            currentQuestion.selectedAnswer = parseInt(selectedChoice.dataset['number']);
        } else if (selectedChoice.parentElement.dataset['number']) {
            answerHTMLElement = selectedChoice.parentElement;
            currentQuestion.selectedAnswer = parseInt(selectedChoice.parentElement.dataset['number']);
        } else {
            answerHTMLElement = selectedChoice.parentElement.parentElement;
            currentQuestion.selectedAnswer = parseInt(selectedChoice.parentElement.parentElement.dataset['number']);
        }


        if (currentQuestion.selectedAnswer === currentQuestion.answer) {
            incrementScore();
        }

        let classToApply;

        if (!practiceMode) {
            classToApply = 'select';
        } else if (practiceMode && currentQuestion.selectedAnswer === currentQuestion.answer) {
            classToApply = 'correct';
        } else {
            classToApply = 'incorrect';
        }

        answerHTMLElement.classList.add(classToApply);

        let questionsDone = getQuestionsDone();
        questionsDone.push(currentQuestion);

        localStorage.setItem('questionsDone', JSON.stringify(questionsDone))

        setTimeout(() => {
            answerHTMLElement.classList.remove(classToApply);
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