let questions = [];
let currentIndex = 0;
let answer = "";
let pos = 0;

let score = 0;
let miss = 0;

document.addEventListener("DOMContentLoaded", async () => {
    await loadCSV();
    showQuestion();
});

async function loadCSV() {
    const res = await fetch("./words.csv");
    const text = await res.text();
    const rows = parseCSV(text);
    questions = rows;
}

function parseCSV(text) {
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = text.trim().split("\n").slice(1);

    return lines.map(line => {
        const cols = line.split(",");
        return {
            display: cols[3],
            answer: cols[4].toLowerCase()
        };
    });
}

function showQuestion() {
    const q = questions[currentIndex];
    document.getElementById("word").textContent = q.display;
    answer = q.answer;
    pos = 0;
    updateProgress();
    updateRunner();
}

function updateProgress() {
    const html = answer
        .split("")
        .map((ch, i) => {
            if (i < pos) return `<span class="typed">${ch}</span>`;
            if (i === pos) return `<span class="current">${ch}</span>`;
            return `<span class="remaining">${ch}</span>`;
        })
        .join("");

    document.getElementById("romaji").innerHTML = html;
}

function updateRunner() {
    const total = questions.length;
    const percent = (currentIndex / total) * 100;
    document.getElementById("runner").style.left = `${percent}%`;
}

document.addEventListener("keydown", e => {
    if (!gameStarted) return;

    const key = e.key.toLowerCase();
    if (key.length !== 1) return;

    if (key === answer[pos]) {
        pos++;
        score += 10;
        updateProgress();

        if (pos >= answer.length) {
            currentIndex++;
            updateRunner();

            if (currentIndex >= questions.length) {
                alert("終了！ Score: " + score);
                return;
            }
            showQuestion();
        }
    } else {
        miss++;
    }

    document.getElementById("score").textContent = score;
    document.getElementById("miss").textContent = miss;
});
