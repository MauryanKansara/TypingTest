const apiUrl = "https://api.quotable.io/random?minLength=70&maxLength=140";
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput = document.getElementById('inputQuote');
const timer = document.getElementById('timer');
const button = document.getElementById('btn');
const score = document.getElementById('score');

let previousLength = quoteInput.value;
let inputLength = 0;
let firstCall = true;
let stopTimer = false;
let correctCharacters = 0;

let quote, currentLength, quoteLength, startTime, arrayQuote, mistakes, speed, accuracy;

quoteInput.addEventListener('input', (e) => {

  if (inputLength >= quoteLength) {
    button.value = "Start"
    inputTaken();
    return;
  }
  if (firstCall) {
    button.value = 'Stop';
    stopTimer = false;
    firstCall = false;
    startTimer();
  }
  arrayQuote = quoteDisplay.querySelectorAll('span');
  const inputValues = quoteInput.value.split('');
  currentLength = e.target.value;

  arrayQuote.forEach((characterSpan, index) => {
    if (inputValues[index] == null) {
      characterSpan.classList.remove('correct')
      characterSpan.classList.remove('incorrect')
    }
    else if (characterSpan.innerText === inputValues[index]) {
      characterSpan.classList.add('correct')
      characterSpan.classList.remove('incorrect')
    } else {
      characterSpan.classList.add('incorrect')
      characterSpan.classList.remove('correct')
    }
  })

  if (previousLength.length > currentLength.length) { // check if the key pressed was backspace or not.
    inputLength--;
  } else {
    inputLength++;
  }
  previousLength = currentLength;
})

async function getQuoteFromAPI() {
  quoteDisplay.innerText = "Loading...";
  try {
    const response = await fetch(apiUrl);
    quote = await response.json();
    quoteLength = quote.content.length;
    quoteDisplay.innerText = "";
    quote.content.split('').forEach(character => {
      const characterSpan = document.createElement('span');
      characterSpan.innerText = character;
      quoteDisplay.appendChild(characterSpan);
    });
    quoteInput.value = null;
  } catch (error) { }
}

function startTimer() {
  timer.innerText = 0
  startTime = new Date()
  setInterval(() => {
    if (quoteInput.disabled || stopTimer) return;
    timer.innerText = getTimerTime()
  }, 1000)
}

function getTimerTime() {
  return Math.floor((new Date() - startTime) / 1000)
}


button.addEventListener('click', () => {
  if (inputLength === 0) return;

  if (button.value === 'Start') {
    firstCall = true;
    timer.innerText = 0;
    quoteInput.disabled = false;
    quoteInput.value = null;
    quoteDisplay.innerText = '';
    stopTimer = true;
    inputLength = 0;
    button.value = 'Stop'
    getQuoteFromAPI();
  } else {
    button.value = 'Start';
    inputTaken();
  }
})

function calculateAccuracy(correctCharacters, quoteLength) {
  mistakes = quoteDisplay.querySelectorAll('.incorrect').length;

  return (((quoteInput.value.length - mistakes) / quoteInput.value.length) * 100).toFixed(2);
}

function calculateSpeed(userInput, timeTaken) {
  let totalWords = userInput / 5;
  let wpm = Math.round(totalWords / (timeTaken / 60));

  if (wpm > 0)
    return wpm;
  else
    return 0;
}

// Helper function, gets called when user has clicked the stop button or when the textarea's input length > quote length.
function inputTaken() {
  const quoteValue = quoteInput.value.trim();
  quoteInput.disabled = true;
  quoteInput.value = quoteValue;
  firstCall = true;
  accuracy = calculateAccuracy(correctCharacters, arrayQuote.length);
  speed = calculateSpeed(quoteValue.length, parseInt(timer.innerText));
  const displayScore = `<div class = "scores">
                  <strong>Speed: ${speed}WPM</strong>
                  &emsp; &emsp;
                  <strong>Accuracy: ${accuracy}%</strong>
                  &emsp; &emsp;
                  <strong>Mistakes: ${mistakes}</strong>
                  </div>
                  <h3>${highestScore()}</h3>
                  `;
  score.innerHTML = displayScore;
}

function highestScore() {
  const storedScore = parseInt(localStorage.getItem('highestScore'));
  const storedAccuracy = parseInt(localStorage.getItem('accuracy'));
  const storedMistakes = parseInt(localStorage.getItem('mistakes'));

  if (storedScore === null || isNaN(storedScore)) { // The values of previous high score is not stored... maybe user is visiting the site for the first time or has cleared the localStorage.
    localStorage.setItem('highestScore', speed);
    localStorage.setItem('mistakes', mistakes);
    localStorage.setItem('accuracy', accuracy);

    return `Congratulations, your new highest score is: ${speed}WPM with ${accuracy} accuracy & ${mistakes} mistakes`;
  }
  else if ((accuracy && speed) >= (storedAccuracy && storedScore)) { // if current score is higher than previous high score
    localStorage.setItem('highestScore', speed);
    localStorage.setItem('mistakes', mistakes);
    localStorage.setItem('accuracy', accuracy);

    return `Congratulations, your new highest score is: ${speed}WPM with ${accuracy} accuracy & ${mistakes} mistakes`;
  }
  else { // if current score is less than previous high score
    return `Your current highest score is: ${storedScore}WPM with ${storedAccuracy} accuracy & ${storedMistakes} mistakes`;
  }
}

getQuoteFromAPI();
