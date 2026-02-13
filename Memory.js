const themes = {
    animals: {
        colors: ['#ff7043', '#5d4037', '#ffd180'],
        emojis: ['🐶','🐱','🦁','🐼','🐸','🐵','🦊','🐯','🐮','🐰']
    },
    plants: {
        colors: ['#2e7d32', '#66bb6a', '#c8e6c9'],
        emojis: ['🌿','🌱','🌵','🌲','🌳','🍀','🌸','🌻','🌹','🍁']
    },
    emoji: {
        colors: ['#ffca28', '#f57c00', '#ffecb3'],
        emojis: ['😀','😂','😍','😎','🥳','😭','😡','😴','🤓','😱']
    }
};

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let score = 0;
let timeLeft = 180;
let matchedPairs = 0;
let lastMatchTime = Date.now();

let timerInterval = null;

function startGame(theme) {
    document.getElementById('theme-screen').classList.add('hidden');

    document.getElementById('game-ui').classList.remove('hidden');

    const root = document.documentElement;
    root.style.setProperty('--primary', themes[theme].colors[0]);
    root.style.setProperty('--secondary', themes[theme].colors[1]);
    root.style.setProperty('--accent', themes[theme].colors[2]);

    score = 0;
    timeLeft = 180;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    lastMatchTime = Date.now();

    document.getElementById('score').textContent = `⭐ Score: ${score}`;
    document.getElementById('timer').textContent = `⏱️ ${timeLeft}`;

    setupBoard(themes[theme].emojis);
    startCountdown();
}

function setupBoard(emojis) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    let cards = [];

    emojis.forEach(emoji => {
        for (let i = 0; i < 5; i++) {
            cards.push(emoji);
        }
    });

    cards.sort(() => Math.random() - 0.5);

    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${emoji}</div>
            </div>
        `;

        card.addEventListener('click', () => flipCard(card, emoji));
        board.appendChild(card);
    });
}

function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    let count = 5;

    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('flipped');
    });

    const interval = setInterval(() => {
        countdownEl.textContent = count;

        if (count === 1) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('flipped');
            });
        }

        count--;

        if (count < 0) {
            clearInterval(interval);
            countdownEl.textContent = '';
            startTimer();
        }
    }, 1000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `⏱️ ${timeLeft}`;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function flipCard(card, emoji) {
    if (lockBoard) return;
    if (card === firstCard?.card) return;

    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = { card, emoji };
        return;
    }

    secondCard = { card, emoji };
    checkMatch();
}

function checkMatch() {
    lockBoard = true;

    if (firstCard.emoji === secondCard.emoji) {
        matchedPairs++;

        const now = Date.now();
        const speedBonus = Math.max(
            1,
            Math.floor((lastMatchTime + timeLeft * 1000 - now) / 500)
        );

        score += speedBonus;
        lastMatchTime = now;

        document.getElementById('score').textContent = `⭐ Score: ${score}`;
        resetBoard();

        if (matchedPairs === 50) {
            endGame(true);
        }
    } else {
        setTimeout(() => {
            firstCard.card.classList.remove('flipped');
            secondCard.card.classList.remove('flipped');
            resetBoard();
        }, 800);
    }
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function endGame(won) {
    clearInterval(timerInterval);

    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');

    const storedHighScore = parseInt(localStorage.getItem('highScore')) || 0;
    const storedHighTime = parseInt(localStorage.getItem('highTime')) || 0;

    if (score > storedHighScore) {
        localStorage.setItem('highScore', score);
        localStorage.setItem('highTime', timeLeft);
    }

    document.getElementById('final-stats').innerHTML = `
        ${won ? '🎉 You Found All Matches!' : '⏰ Time’s Up!'}<br><br>
        ⭐ Score: ${score}<br>
        ⏱️ Remaining Time: ${timeLeft}s<br><br>
        🏆 High Score: ${localStorage.getItem('highScore')}<br>
        ⏳ Best Remaining Time: ${localStorage.getItem('highTime')}s
    `;
}

function replayGame() {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('theme-screen').classList.remove('hidden');
}