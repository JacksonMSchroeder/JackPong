const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 600;

// --- ESTADO DO JOGO ---
let playerScore = 0, computerScore = 0, displayLevel = 1;
const winningScore = 10;
let gameStarted = false, gameOver = false, lastScorer = "player";

// --- CONTROLES ---
const keys = {};
const playerSpeed = 10; 

// --- BOLA ---
let ballRadius = 10;
let ballX = 600, ballY = 300;
let ballSpeedX = 0, ballSpeedY = 0;
let ballTrail = [];
const trailLength = 8;

// REFINADO: Velocidade começa em 5 (bem mais lenta e amigável)
function getLevelSpeed() {
    return 5 + (displayLevel * 0.25); 
}

// --- RAQUETES ---
const paddleWidth = 15;
const basePaddleHeight = 110;
let playerY = 245, computerY = 245;
let computerErrorY = 0;

function getEnemyHeight() {
    return basePaddleHeight + ((displayLevel - 1) * 0.08 * basePaddleHeight);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballTrail = [];
    let currentCompH = getEnemyHeight();
    playerY = (canvas.height - basePaddleHeight) / 2;
    computerY = (canvas.height - currentCompH) / 2;
    
    let speed = getLevelSpeed();
    ballSpeedX = (lastScorer === "player" ? 1 : -1) * speed;
    ballSpeedY = 0; 
    computerErrorY = 0;
}

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (gameOver) {
        if (playerScore >= winningScore) displayLevel = Math.min(6, displayLevel + 1);
        else displayLevel = 1; 
        playerScore = 0; computerScore = 0;
        gameOver = false; gameStarted = false;
        resetBall();
        return;
    }
    if (!gameStarted) { gameStarted = true; resetBall(); }
});
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

function update() {
    if (!gameStarted || gameOver) return;

    ballTrail.push({ x: ballX, y: ballY });
    if (ballTrail.length > trailLength) ballTrail.shift();

    if ((keys["w"] || keys["arrowup"]) && playerY > 0) playerY -= playerSpeed;
    if ((keys["s"] || keys["arrowdown"]) && playerY < canvas.height - basePaddleHeight) playerY += playerSpeed;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // IA DO JACK REFINADA (Mais lenta no início)
    let currentCompH = getEnemyHeight();
    if (ballSpeedX > 0 && ballX > canvas.width * 0.4) {
        let computerAgility = 2.5 + (displayLevel * 0.7); // Começa em 3.2 no LV1
        let targetY = ballY - (currentCompH / 2) + computerErrorY;
        
        if (computerY < targetY - 5) computerY += computerAgility;
        else if (computerY > targetY + 5) computerY -= computerAgility;
    }

    // Colisões Parede
    if (ballY - ballRadius < 0) { ballY = ballRadius; ballSpeedY = Math.abs(ballSpeedY); }
    if (ballY + ballRadius > canvas.height) { ballY = canvas.height - ballRadius; ballSpeedY = -Math.abs(ballSpeedY); }

    let speed = getLevelSpeed();

    // --- COLISÃO PLAYER (REFINADA PARA SER MAIS FÁCIL) ---
    // Adicionei uma margem de segurança de 10px para as bordas da raquete
    if (ballX - ballRadius <= paddleWidth && ballX > 0) {
        if (ballY > playerY - 10 && ballY < playerY + basePaddleHeight + 10) {
            ballSpeedX = speed;
            let deltaY = ballY - (playerY + basePaddleHeight/2);
            ballSpeedY = deltaY * 0.2; 
            ballX = paddleWidth + ballRadius; 
            
            // Margem de erro do Jack
            let errorMargin = 60 - (displayLevel * 8);
            computerErrorY = (Math.random() - 0.5) * errorMargin;
        }
    }

    // Colisão Jack
    if (ballX + ballRadius >= canvas.width - paddleWidth && ballX < canvas.width) {
        if (ballY > computerY - 5 && ballY < computerY + currentCompH + 5) {
            ballSpeedX = -speed;
            let deltaY = ballY - (computerY + currentCompH/2);
            ballSpeedY = deltaY * 0.2;
            ballX = canvas.width - paddleWidth - ballRadius;
        }
    }

    if (ballX < 0 || ballX > canvas.width) {
        if (ballX < 0) { computerScore++; lastScorer = "computer"; }
        else { playerScore++; lastScorer = "player"; }
        if (playerScore >= winningScore || computerScore >= winningScore) gameOver = true;
        else { gameStarted = false; resetBall(); }
    }
}

function draw() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let currentColor = `hsl(${200 - (displayLevel * 30)}, 80%, 50%)`;

    // Placar
    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.textAlign = "center";
    ctx.fillText(playerScore, canvas.width / 4, canvas.height / 2 + 45);
    ctx.fillText(computerScore, (canvas.width / 4) * 3, canvas.height / 2 + 45);

    // Rastro
    ballTrail.forEach((pos, i) => {
        ctx.globalAlpha = i / trailLength * 0.2;
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Raquetes e Bola
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, playerY, paddleWidth, basePaddleHeight);
    ctx.fillStyle = currentColor;
    let currentCompH = getEnemyHeight();
    ctx.fillRect(canvas.width - paddleWidth, computerY, paddleWidth, currentCompH);
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();

    if (!gameStarted && !gameOver) {
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 20px Arial";
        ctx.fillText("MODO TREINO: NÍVEL 1", 600, 260);
        ctx.font = "bold 40px Arial";
        ctx.fillText("PRESSIONE PARA COMEÇAR", 600, 400);
        ctx.fillStyle = currentColor;
        ctx.fillText(`NÍVEL ATUAL: ${displayLevel} / 6`, 600, 440);
    }

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = (playerScore >= 10) ? "#00FF00" : "#FF0000";
        ctx.font = "bold 70px Arial";
        ctx.fillText(playerScore >= 10 ? "VITÓRIA!" : "DERROTA!", 600, 300);
    }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();