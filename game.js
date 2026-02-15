const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// --- VARIÁVEIS DE ESTADO ---
let playerScore = 0;
let computerScore = 0;
let level = 1;

// --- CONFIGURAÇÕES DA BOLA ---
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4;
let ballSpeedY = 4;
const ballRadius = 10;

// --- CONFIGURAÇÕES DAS BARRAS ---
const paddleWidth = 15;
const paddleHeight = 100;
let playerY = (canvas.height - paddleHeight) / 2;
let computerY = (canvas.height - paddleHeight) / 2;
let computerSpeed = 3; // Começa mais lento

// Interação Mouse
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    playerY = e.clientY - rect.top - paddleHeight / 2;
});

function update() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // IA do Computador
    let computerCenter = computerY + paddleHeight / 2;
    if (computerCenter < ballY - 35) computerY += computerSpeed;
    else if (computerCenter > ballY + 35) computerY -= computerSpeed;

    // Colisão Paredes
    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) ballSpeedY *= -1;

    // Colisão Jogador
    if (ballX - ballRadius < paddleWidth) {
        if (ballY > playerY && ballY < playerY + paddleHeight) {
            ballSpeedX *= -1;
            ballSpeedX *= 1.05; // Acelera um pouco a cada batida
        } else if (ballX < 0) {
            computerScore++;
            checkLevel();
            resetBall();
        }
    }

    // Colisão Computador
    if (ballX + ballRadius > canvas.width - paddleWidth) {
        if (ballY > computerY && ballY < computerY + paddleHeight) {
            ballSpeedX *= -1;
        } else if (ballX > canvas.width) {
            playerScore++;
            checkLevel();
            resetBall();
        }
    }
}

function checkLevel() {
    // A cada 3 pontos do jogador, aumenta o nível
    if (playerScore > 0 && playerScore % 3 === 0) {
        level++;
        ballSpeedX += (ballSpeedX > 0 ? 1 : -1); // Aumenta velocidade base
        computerSpeed += 0.5; // IA fica mais esperta
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (playerScore + computerScore) % 2 === 0 ? 4 : -4;
}

function draw() {
    // Fundo muda de cor conforme o nível
    ctx.fillStyle = level % 2 === 0 ? "#1a1a1a" : "#000"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Placar e Nível
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Jogador: ${playerScore}`, 100, 30);
    ctx.fillText(`Nível: ${level}`, canvas.width / 2 - 30, 30);
    ctx.fillText(`Bot: ${computerScore}`, canvas.width - 180, 30);

    // Barras e Bola
    ctx.fillStyle = "#00ffcc"; // Jogador
    ctx.fillRect(0, playerY, paddleWidth, paddleHeight);

    ctx.fillStyle = "#ff0055"; // Inimigo
    ctx.fillRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();