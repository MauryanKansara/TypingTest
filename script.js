const apiUrl = "https://api.quotable.io/random?minLength=70&maxLength=140";
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput = document.getElementById('inputQuote');
const timer = document.getElementById('timer');
const playAgain = document.getElementById('playAgain');
const score = document.getElementById('score');

let previousLength = quoteInput.value;
let inputLength = 0;
let firstCall = true;
let stopTimer = false;
let correctCharacters = 0;

let quote, currentLength, quoteLength, startTime, arrayQuote, mistakes, speed, accuracy;

quoteInput.addEventListener('input',(e) => {
  if(inputLength >= quoteLength){
    const quoteValue = quoteInput.value.trim();
    quoteInput.disabled = true;
    quoteInput.value = quoteValue;
    playAgain.style.display = 'block';
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
    return;
  }
  if(firstCall) {
    stopTimer = false;
    firstCall = false;
    startTimer();
  }
  arrayQuote = quoteDisplay.querySelectorAll('span');
  const inputValues = quoteInput.value.split('');
  currentLength = e.target.value;

  arrayQuote.forEach((characterSpan, index) => {
    if(inputValues[index] == null) {
      characterSpan.classList.remove('correct')
      characterSpan.classList.remove('incorrect')
    }
    else if(characterSpan.innerText === inputValues[index]){
      characterSpan.classList.add('correct')
      characterSpan.classList.remove('incorrect')
    } else {
      characterSpan.classList.add('incorrect')
      characterSpan.classList.remove('correct')
    }
  })

  if(previousLength.length > currentLength.length) { // check if the key pressed was backspace or not.
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
    } catch (error) {}
  }

  function startTimer() {
    timer.innerText = 0
    startTime = new Date()
    setInterval(() => {
      if(quoteInput.disabled || stopTimer) return;
      timer.innerText = getTimerTime()
    }, 1000)
  }

  function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000)
  }

  playAgain.addEventListener('click', () => {
    firstCall = true;
    timer.innerText = 0;
    quoteInput.disabled = false;
    quoteInput.value = null;
    quoteDisplay.innerText = '';
    stopTimer = true;
    inputLength = 0;
    getQuoteFromAPI();
  })

  function calculateAccuracy(correctCharacters, quoteLength){
    mistakes = quoteDisplay.querySelectorAll('.incorrect').length;

    return (((quoteInput.value.length - mistakes) / quoteInput.value.length) * 100).toFixed(2);
  }

  function calculateSpeed(userInput, timeTaken){
    let totalWords = userInput / 5;
    let wpm = totalWords / (timeTaken / 60);
    return Math.round(wpm);
  }

  function highestScore(){
    const storedScore = localStorage.getItem('highestScore');
    const storedAccuracy = localStorage.getItem('highestScore');
    const storedMistakes = localStorage.getItem('mistakes');

    if(speed && accuracy > storedScore && storedAccuracy){
      localStorage.setItem('highestScore', speed);
      localStorage.setItem('mistakes', mistakes);
      localStorage.setItem('accuracy', accuracy);
      return `Congratulations, your new highest score is: ${speed}WPM with ${accuracy} accuracy & ${mistakes} mistakes`;
    } else {
      return `Your current highest score is: ${storedScore}WPM with ${storedAccuracy} accuracy & ${storedMistakes} mistakes`;
    }
  }

getQuoteFromAPI();
