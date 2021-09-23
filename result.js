const finalScoreElement = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const questionAnswered = localStorage.getItem('questionAnswered');

finalScoreElement.innerText = mostRecentScore+"/"+questionAnswered;