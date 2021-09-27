const start = document.getElementById('start');

start.addEventListener('click', (e) => {

    const nbQuestions = document.getElementById('nbQuestions').value;
    const training = document.getElementById('training').checked;
    const tests = document.getElementById('test-select').value;

    return window.location.assign(`test.html?type=${tests}&nbQuestions=${nbQuestions}&training=${training}`);
});
