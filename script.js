const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const livesEl = document.getElementById('lives');
const finalScoreEl = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let highScore = localStorage.getItem('pixelGalaxyHS') || 0;
let lives = 3;
let isGameRunning = false;
let animationId;
let frames = 0;
let bullets = [];
let enemies = [];
let stars = [];

highScoreEl.innerText = highScore;

const keys = { up: false, down: false, left: false, right: false };

const player = {
    x: canvas.width / 2 - 10,
    y: canvas.height - 60,
    w: 20,
    h: 20,
    speed: 5,
    draw() {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x + 8, this.y, 4, 4);
        ctx.fillRect(this.x + 4, this.y + 4, 12, 4);
        ctx.fillRect(this.x, this.y + 8, 20, 8);
        ctx.fillRect(this.x + 4, this.y + 16, 4, 4);
        ctx.fillRect(this.x + 12, this.y + 16, 4, 4);
    },
    update() {
        if (keys.left && this.x > 0) this.x -= this.speed;
        if (keys.right && this.x < canvas.width - this.w) this.x += this.speed;
        if (keys.up && this.y > 0) this.y -= this.speed;
        if (keys.down && this.y < canvas.height - this.h) this.y += this.speed;
    }
};

for(let i=0; i<40; i++) {
    stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*2 + 1 });
}

function spawnEnemy() {
    const size = 20;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        w: size,
        h: size,
        speed: 2 + Math.random() * 2
    });
}

function shoot() {
    bullets.push({ x: player.x + 8, y: player.y, w: 4, h: 10, speed: 7 });
}

function startGame() {
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    frames = 0;
    player.x = canvas.width / 2 - 10;
    player.y = canvas.height - 60;
    scoreEl.innerText = score;
    livesEl.innerText = lives;
    isGameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    loop();
}

function handleGameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('pixelGalaxyHS', highScore);
        highScoreEl.innerText = highScore;
    }
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function update() {
    frames++;
    player.update();

    stars.forEach(star => {
        star.y += star.s;
        if(star.y > canvas.height) star.y = 0;
    });

    if (frames % 15 === 0) shoot();
    if (frames % 50 === 0) spawnEnemy();

    bullets.forEach((b, bi) => {
        b.y -= b.speed;
        if (b.y < -10) bullets.splice(bi, 1);
    });

    enemies.forEach((e, ei) => {
        e.y += e.speed;
        
        if (e.y > canvas.height) {
            enemies.splice(ei, 1);
            lives--;
            livesEl.innerText = lives;
        }

        if (player.x < e.x + e.w && player.x + player.w > e.x && player.y < e.y + e.h && player.y + player.h > e.y) {
            enemies.splice(ei, 1);
            lives--;
            livesEl.innerText = lives;
        }

        bullets.forEach((b, bi) => {
            if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score += 10;
                scoreEl.innerText = score;
            }
        });

        if (lives <= 0) handleGameOver();
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    stars.forEach(s => ctx.fillRect(s.x, s.y, 1, 1));
    player.draw();
    ctx.fillStyle = '#FF0';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.fillStyle = '#F00';
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y + 4, 20, 8);
        ctx.fillRect(e.x + 4, e.y, 4, 4);
        ctx.fillRect(e.x + 12, e.y, 4, 4);
    });
}

function loop() {
    if (!isGameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.up = true;
    if (k === 's' || e.key === 'ArrowDown') keys.down = true;
    if (k === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if (k === 'd' || e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.up = false;
    if (k === 's' || e.key === 'ArrowDown') keys.down = false;
    if (k === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (k === 'd' || e.key === 'ArrowRight') keys.right = false;
});

const bindBtn = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener('mousedown', () => { keys[key] = true; });
    btn.addEventListener('mouseup', () => { keys[key] = false; });
    btn.addEventListener('mouseleave', () => { keys[key] = false; });
};

bindBtn('upBtn', 'up'); bindBtn('downBtn', 'down'); bindBtn('leftBtn', 'left'); bindBtn('rightBtn', 'right');
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);