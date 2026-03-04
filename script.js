const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapList = document.getElementById('lapList');
const display = document.querySelector('.display');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let lapStartTime = 0;
let lapCount = 0;

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    milliseconds: String(milliseconds).padStart(2, '0'),
  };
}

function updateDisplay(ms) {
  const { minutes, seconds, milliseconds } = formatTime(ms);
  minutesEl.textContent = minutes;
  secondsEl.textContent = seconds;
  millisecondsEl.textContent = milliseconds;
}

function tick() {
  elapsedTime = Date.now() - startTime;
  updateDisplay(elapsedTime);
}

function start() {
  startTime = Date.now() - elapsedTime;
  lapStartTime = lapStartTime === 0 ? startTime : Date.now() - (elapsedTime - getLapElapsed());
  timerInterval = setInterval(tick, 10);
  isRunning = true;

  startStopBtn.textContent = 'ストップ';
  startStopBtn.classList.add('running');
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  display.classList.add('running');
}

function stop() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;

  startStopBtn.textContent = 'スタート';
  startStopBtn.classList.remove('running');
  lapBtn.disabled = true;
  display.classList.remove('running');
}

function reset() {
  stop();
  elapsedTime = 0;
  lapStartTime = 0;
  lapCount = 0;
  updateDisplay(0);
  lapList.innerHTML = '';
  lapBtn.disabled = true;
  resetBtn.disabled = true;
}

function getLapElapsed() {
  if (lapCount === 0) return 0;
  const items = lapList.querySelectorAll('li');
  if (items.length === 0) return 0;
  return parseInt(items[0].dataset.total || '0', 10);
}

function lap() {
  lapCount++;
  const lapTime = elapsedTime - (lapCount === 1 ? 0 : getLapTotalAt(lapCount - 1));
  const totalTime = elapsedTime;

  const li = document.createElement('li');
  li.dataset.total = totalTime;

  const lapNum = document.createElement('span');
  lapNum.className = 'lap-number';
  lapNum.textContent = `ラップ ${lapCount}`;

  const lapSplit = document.createElement('span');
  lapSplit.className = 'lap-split';
  const splitFmt = formatTime(lapTime);
  lapSplit.textContent = `${splitFmt.minutes}:${splitFmt.seconds}.${splitFmt.milliseconds}`;

  const lapTotal = document.createElement('span');
  lapTotal.className = 'lap-total';
  const totalFmt = formatTime(totalTime);
  lapTotal.textContent = `${totalFmt.minutes}:${totalFmt.seconds}.${totalFmt.milliseconds}`;

  li.appendChild(lapNum);
  li.appendChild(lapSplit);
  li.appendChild(lapTotal);

  lapList.insertBefore(li, lapList.firstChild);
}

function getLapTotalAt(n) {
  const items = lapList.querySelectorAll('li');
  for (const item of items) {
    const num = item.querySelector('.lap-number').textContent;
    if (num === `ラップ ${n}`) {
      return parseInt(item.dataset.total || '0', 10);
    }
  }
  return 0;
}

startStopBtn.addEventListener('click', () => {
  if (isRunning) {
    stop();
  } else {
    start();
  }
});

lapBtn.addEventListener('click', () => {
  if (isRunning) lap();
});

resetBtn.addEventListener('click', reset);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    startStopBtn.click();
  } else if (e.code === 'KeyL' && isRunning) {
    lapBtn.click();
  } else if (e.code === 'KeyR') {
    resetBtn.click();
  }
});
