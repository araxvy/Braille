const charSets = {
  braille: [...Array(256)].map((_, i) => String.fromCharCode(0x2800 + i)).join('')
};

const spotSettings = {
  spotGridSize: 10,
  charSet: charSets.braille,
  currentSpot: null,
  targetChar: null,
  timer: 15000,
  required: 6,
  currentScore: 0
};

let spotInterval;
let preventClick = false;

function playSuspenseSound() {
  const sound = document.getElementById('suspense-sound');
  sound.currentTime = 0;
  sound.play();
}

function createSpotGrid(gridSize) {
  const grid = $('#spot-grid').empty();
  const total = gridSize * gridSize;
  let template = '';
  for (let i = 0; i < total; i++) {
    template += `<div class="spot-grid-square" data-spot="${i}"><div class="spot-square-text">?</div></div>`;
  }
  grid.append(template);
}

function updateSpotSquares() {
  clearInterval(spotInterval);
  spotInterval = setInterval(() => {
    const randomSquare = Math.floor(Math.random() * spotSettings.spotGridSize ** 2);
    if (randomSquare == spotSettings.currentSpot) return;
    const randomChar = spotSettings.charSet[Math.floor(Math.random() * spotSettings.charSet.length)];
    if (randomChar == spotSettings.targetChar) return;
    $(`[data-spot=${randomSquare}] .spot-square-text`).fadeOut(200, function () {
      $(this).text(randomChar).fadeIn(200);
    });
  }, 30);
}

function startTimer() {
  $('#spot-timer-bar-inner').stop().css('width', '100%').animate({ width: '0%' }, {
    duration: spotSettings.timer,
    complete: () => endSpotGame(false)
  });
}

function startSpotGame() {
  $('#play-again-btn').hide();
  spotSettings.currentScore = 0;
  createSpotGrid(spotSettings.spotGridSize);
  spotSettings.targetChar = spotSettings.charSet[Math.floor(Math.random() * spotSettings.charSet.length)];
  $('#spot-target').text(spotSettings.targetChar);
  spotSettings.currentSpot = Math.floor(Math.random() * spotSettings.spotGridSize ** 2);
  $(`[data-spot=${spotSettings.currentSpot}] .spot-square-text`).text(spotSettings.targetChar);
  playSuspenseSound();
  updateSpotSquares();
  startTimer();
}

function endSpotGame(win) {
  clearInterval(spotInterval);
  $('#spot-timer-bar-inner').stop();
  $('#spot-target').text(win ? '✅ Success!' : '❌ Failed');
  $('#play-again-btn').fadeIn();
}

$(document).ready(() => {
  startSpotGame();
});

$('#spot-grid').on('click', '.spot-grid-square', function () {
  if (preventClick) return;
  if ($(this).data('spot') == spotSettings.currentSpot) {
    spotSettings.currentScore++;
    if (spotSettings.currentScore >= spotSettings.required) {
      endSpotGame(true);
      return;
    }
    $('#spot-timer-bar-inner').stop().css('width', '100%');
    preventClick = true;
    let newSpot;
    do {
      newSpot = Math.floor(Math.random() * spotSettings.spotGridSize ** 2);
    } while (newSpot === spotSettings.currentSpot);
    let char;
    do {
      char = spotSettings.charSet[Math.floor(Math.random() * spotSettings.charSet.length)];
    } while (char === spotSettings.targetChar);
    clearInterval(spotInterval);
    const oldEl = $(`[data-spot=${spotSettings.currentSpot}] .spot-square-text`);
    oldEl.fadeOut(200, function () {
      oldEl.text(char).fadeIn(200);
      spotSettings.currentSpot = newSpot;
      $(`[data-spot=${newSpot}] .spot-square-text`).text(spotSettings.targetChar);
      updateSpotSquares();
      preventClick = false;
      startTimer();
    });
  }
});

$('#play-again-btn').on('click', function () {
  startSpotGame();
});
