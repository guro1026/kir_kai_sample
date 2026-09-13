/* =========================================================
   GLOBAL STATE
========================================================= */
let questions = [];
let currentIndex = 0;
let pos = 0;
let score = 0;
let miss = 0;
let gameStarted = false;
let selectedSection = 0;

/* DOM SHORTCUTS */
const DOM = {
    word: document.getElementById("word"),
    romaji: document.getElementById("romaji"),
    score: document.getElementById("score"),
    miss: document.getElementById("miss"),
    percent: document.getElementById("percent"),
    runner: document.getElementById("runner"),
    countdownScreen: document.getElementById("countdown-screen"),
    countdown: document.getElementById("countdown"),
    resultScreen: document.getElementById("result-screen"),
    resultSection: document.getElementById("result-section"),
    resultScore: document.getElementById("result-score"),
    resultMiss: document.getElementById("result-miss"),
    resultAccuracy: document.getElementById("result-accuracy"),
    resultRetry: document.getElementById("result-retry"),
    effectGood: document.getElementById("effect-good"),
    effectMiss: document.getElementById("effect-miss"),
    effectBoost: document.getElementById("effect-boost")
};

/* =========================================================
   CSV PARSER
========================================================= */
function parseCSV(text) {
    const lines = text.trim().split("\n");
    const header = lines[0].split(",");
    return lines.slice(1).map(line => {
        const cols = line.split(",");
        return {
            question_no: cols[0],
            section: cols[1],
            genre: cols[2],
            display: cols[3],
            answer: cols[4]
        };
    });
}

/* =========================================================
   SECTION SELECT
========================================================= */
document.querySelectorAll("#section-select button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedSection = btn.dataset.section;
        startSection(selectedSection);
    });
});

/* =========================================================
   LOAD SECTION
========================================================= */
async function startSection(sec) {
    const file = `data/section${sec}.csv`;
    const res = await fetch(file);
    const text = await res.text();
    questions = parseCSV(text);

    currentIndex = 0;
    pos = 0;
    score = 0;
    miss = 0;

    document.getElementById("title-screen").style.display = "none";
    startCountdown();
}

/* =========================================================
   COUNTDOWN
========================================================= */
async function startCountdown() {
    DOM.countdownScreen.style.display = "flex";

    const seq = ["3", "2", "1", "GO!!"];
    for (let i = 0; i < seq.length; i++) {
        DOM.countdown.textContent = seq[i];
        DOM.countdown.style.animation = "none";
        void DOM.countdown.offsetWidth;
        DOM.countdown.style.animation = "";
        await new Promise(r => setTimeout(r, 800));
    }

    DOM.countdownScreen.style.display = "none";
    gameStarted = true;
    showQuestion();
}

/* =========================================================
   SHOW QUESTION
========================================================= */
function showQuestion() {
    const q = questions[currentIndex];
    DOM.word.textContent = q.display;
    updateRomaji();
}

/* =========================================================
   ROMAJI PROGRESS
========================================================= */
function updateRomaji() {
    const q = questions[currentIndex];
    const typed = q.answer.slice(0, pos);
    const current = q.answer.slice(pos, pos + 1);
    const remaining = q.answer.slice(pos + 1);

    DOM.romaji.innerHTML = `
        <span class="typed">${typed}</span>
        <span class="current">${current}</span>
        <span class="remaining">${remaining}</span>
    `;
}

/* =========================================================
   RUNNER PROGRESS (本番と同じ)
========================================================= */
function updateRunner() {
    const totalChars = questions.reduce((sum, q) => sum + q.answer.length, 0);
    const typedChars =
        questions.slice(0, currentIndex).reduce((sum, q) => sum + q.answer.length, 0) + pos;

    const percent = (typedChars / totalChars) * 100;
    DOM.percent.textContent = `${percent.toFixed(1)}%`;

    const runnerPercent = Math.min(92, 2 + (percent * 0.9));
    DOM.runner.style.left = `${runnerPercent}%`;
}

/* =========================================================
   EFFECTS
========================================================= */
function flashEffect(el) {
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 250);
}

/* =========================================================
   KEY INPUT
========================================================= */
document.addEventListener("keydown", e => {
    if (!gameStarted) return;

    const q = questions[currentIndex];
    const key = e.key.toLowerCase();

    if (key === q.answer[pos]) {
        pos++;
        score++;
        DOM.score.textContent = score;
        flashEffect(DOM.effectGood);

        if (pos === q.answer.length) {
            currentIndex++;
            pos = 0;

            if (currentIndex >= questions.length) {
                finishGame();
                return;
            }
            showQuestion();
        }
    } else {
        miss++;
        DOM.miss.textContent = miss;
        flashEffect(DOM.effectMiss);
    }

    updateRomaji();
    updateRunner();
});

/* =========================================================
   FINISH GAME → RESULT SCREEN
========================================================= */
function finishGame() {
    gameStarted = false;

    const total = score + miss;
    const accuracy = total === 0 ? 0 : (score / total) * 100;

    DOM.resultSection.textContent = `SECTION ${selectedSection}`;
    DOM.resultScore.textContent = `Score: ${score}`;
    DOM.resultMiss.textContent = `Miss: ${miss}`;
    DOM.resultAccuracy.textContent = `Accuracy: ${accuracy.toFixed(1)}%`;

    DOM.resultScreen.style.display = "flex";
}

/* =========================================================
   RETRY
========================================================= */
DOM.resultRetry.addEventListener("click", () => {
    DOM.resultScreen.style.display = "none";
    document.getElementById("title-screen").style.display = "flex";

    currentIndex = 0;
    pos = 0;
    score = 0;
    miss = 0;
    gameStarted = false;

    DOM.score.textContent = "0";
    DOM.miss.textContent = "0";
    DOM.percent.textContent = "0%";
    DOM.runner.style.left = "0%";
});
