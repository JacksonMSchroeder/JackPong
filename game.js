const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;  
canvas.height = 900;

// --- som -- 
const soundHit = new Audio('assets/audio/bateuraquete.wav');
const soundWin = new Audio('assets/audio/fezgol.wav'); 
const soundLose = new Audio('assets/audio/tomougol.wav');

// tocar sons sem atraso 
function playSFX(audio) {
    audio.currentTime = 0; // o som se ele já estiver tocando
    audio.play().catch(e => console.log("Áudio aguardando Nick...")); 
}

// --: sistema de nick ---
let playerName = "";
let inputActive = true;
let errorMessage = "";

// mensagens de gol
let goalMessage = "";
let goalTimer = 0;

// --- sistema de pausa ---                                   //att pause com continua + pause com volta pro jogo ou menu!
let isPaused = false;

// --- paticulas ---                                       //att cod copiado de um tuturial no yt 
let particles = [];
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color
        });
    }
}

//  NICK                                                             //"login"
function drawNickScreen() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();

    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Arial";
    ctx.fillText("DIGITE SEU NICK e Press Enter", canvas.width / 2, 300);
    
    ctx.font = "20px Arial";
    ctx.fillText("(Há 6 Níveis)", canvas.width / 2, 340);

    ctx.font = "bold 50px Courier New";
    ctx.fillStyle = "#0F0";
    let cursor = (Math.floor(Date.now() / 500) % 2 === 0) ? "_" : " ";
    ctx.fillText(playerName + cursor, canvas.width / 2, 450);

    if (errorMessage) {
        ctx.fillStyle = "#FF0000";
        ctx.font = "20px Arial";
        ctx.fillText(errorMessage, canvas.width / 2, 520);
    }

    ctx.fillStyle = "#555";
    ctx.font = "16px Arial";
    ctx.fillText("Pressione ENTER para confirmar", canvas.width / 2, 600);
}


window.addEventListener("keydown", (e) => {
    
    // --- pause e quit teste                                             TESTE PAUSE + QUIT 
    if (e.key === "Escape") {
        if (!inputActive && !gameOver) {
            if (!isPaused) {
                // pause 
                isPaused = true;
            } else {
                // pausado o game volta para o nick
                isPaused = false;
                inputActive = true;
                gameStarted = false;
                gameOver = false;
                playerScore = 0;
                computerScore = 0;
                displayLevel = 1;
                playerName = "";
            }
            return;
        }
    }

    // --- continuar com enter ---
    if (isPaused && e.key === "Enter") {
        isPaused = false;
        return;
    }

   

    if (!inputActive) return; 

    if (e.key === "Enter") {
        if (playerName.toLowerCase() === "jack") {
            errorMessage = "Só pode haver um JACK! >.<";                        
            playerName = "";
        } else if (playerName.length < 2) {
            errorMessage = "O nick deve ter pelo menos 2 caracteres.";               //decidir entr 2 ou 3 letra para nick
        } else {
            inputActive = false; 
        }
    } else if (e.key === "Backspace") {
        playerName = playerName.slice(0, -1);
        errorMessage = "";
    } else if (e.key.length === 1 && playerName.length < 12) {
        if (/[a-zA-Z0-9]/.test(e.key)) {
            playerName += e.key;
            errorMessage = "";
        }
    }
});

// --- estado do jogo ---
let playerScore = 0, computerScore = 0, displayLevel = 1;
const winningScore = 6;
let gameStarted = false, gameOver = false, lastScorer = "player";

// --- visual ---
let shakeIntensity = 0;
let borderFlashColor = null;
let flashOpacity = 0;

// --- controle do player  ---
const keys = {};
const playerSpeed = 10;
let playerWidth = 110; 
let powerUpActive = false; 
let powerUpTimer = 0;

// --- bola ---
let ballRadius = 10;
let ballX = 300, ballY = 450;
let ballSpeedX = 0, ballSpeedY = 0;
let ballTrail = [];
const trailLength = 8;
let ballSlowed = false; 
let ballSlowTimer = 0;   

function getLevelSpeed() {
    return ballSlowed ? (5 + (displayLevel * 0.25)) * 0.4 : (5 + (displayLevel * 0.25));
}

// --- raquete ---
const paddleHeight = 15;
const basePaddleWidth = 110;
let playerX = 245, computerX = 245;
let computerErrorX = 0;

function getEnemyWidth() { return basePaddleWidth + ((displayLevel - 1) * 0.08 * basePaddleWidth); }

function triggerShake(intensity) { shakeIntensity = intensity; }
function triggerFlash(color) { borderFlashColor = color; flashOpacity = 0.5; }

// --- poderzinhossss (teste) ---
let powerUp = { x: 0, y: 0, active: false, size: 20, speed: 3, type: '' }; 

function spawnPowerUp() {
    if (Math.random() < 0.10 && !powerUp.active) {
        powerUp.x = Math.random() * (canvas.width - powerUp.size);
        powerUp.y = 0;
        powerUp.active = true;
        powerUp.type = Math.random() < 0.5 ? 'wide' : 'slow';
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballTrail = [];
    let currentCompW = getEnemyWidth();
    playerX = (canvas.width - playerWidth) / 2;
    computerX = (canvas.width - currentCompW) / 2;

    playerWidth = basePaddleWidth;
    powerUpActive = false;
    powerUpTimer = 0;
    ballSlowed = false;
    ballSlowTimer = 0;
    powerUp.active = false; 

    let speed = getLevelSpeed();
    ballSpeedY = (lastScorer === "player" ? -speed : speed);
    ballSpeedX = (Math.random() - 0.5) * 4;
    computerErrorX = 0;
}

window.addEventListener("keydown", (e) => {
    if (inputActive || isPaused) return; 

    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") {
        if (gameOver) {
            if (playerScore >= winningScore) {
                displayLevel = Math.min(6, displayLevel + 1);
            }
            playerScore = 0; computerScore = 0;
            gameOver = false; gameStarted = false;
            resetBall();
        } else if (!gameStarted) {
            gameStarted = true;
            resetBall();
        }
    }
});

window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

function update() {
    //  pausado interrompe att
    if (!gameStarted || gameOver || inputActive || isPaused) return;

    if (shakeIntensity > 0) shakeIntensity *= 0.9;
    if (flashOpacity > 0) flashOpacity -= 0.02;
    if (goalTimer > 0) goalTimer--; 

    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    });

    if (powerUpActive && --powerUpTimer <= 0) {
        powerUpActive = false;
        playerWidth = basePaddleWidth;
    }

    if (ballSlowed && --ballSlowTimer <= 0) {
        ballSlowed = false;
        let currentSpeed = getLevelSpeed();
        ballSpeedY = Math.sign(ballSpeedY) * currentSpeed;
        ballSpeedX = Math.sign(ballSpeedX) * currentSpeed;
    }

    if (powerUp.active) {
        powerUp.y += powerUp.speed;
        if (powerUp.y + powerUp.size > canvas.height - paddleHeight &&
            powerUp.x > playerX && powerUp.x < playerX + playerWidth) {
            powerUp.active = false; 
            if (powerUp.type === 'wide') {
                powerUpActive = true; playerWidth = basePaddleWidth * 1.6; powerUpTimer = 420; triggerFlash("#00FF00"); 
            } else if (powerUp.type === 'slow') {
                ballSlowed = true; ballSlowTimer = 360; triggerFlash("#00FFFF"); 
            }
        }
        if (powerUp.y > canvas.height) powerUp.active = false;
    }

    ballTrail.push({ x: ballX, y: ballY });
    if (ballTrail.length > trailLength) ballTrail.shift();

    if ((keys["a"] || keys["arrowleft"]) && playerX > 0) playerX -= playerSpeed;
    if ((keys["d"] || keys["arrowright"]) && playerX < canvas.width - playerWidth) playerX += playerSpeed;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    let currentCompW = getEnemyWidth();
    if (ballSpeedY < 0 && ballY < canvas.height * 0.7) {
        let computerAgility = (ballSlowed ? 1.0 : 1.8) + (displayLevel * 0.45);
        let targetX = ballX - (currentCompW / 2) + computerErrorX;
        if (Math.abs(computerX - targetX) > 10) {
            if (computerX < targetX) computerX += computerAgility;
            else if (computerX > targetX) computerX -= computerAgility;
        }
    }

    if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
        ballSpeedX *= -1;
        triggerShake(3);
        playSFX(soundHit); 
        createParticles(ballX, ballY, "#FFF");
    }

    let speed = getLevelSpeed();
    let currentColor = `hsl(${200 - (displayLevel * 30)}, 80%, 50%)`;

    if (ballSpeedY > 0 && ballY + ballRadius >= canvas.height - paddleHeight) {
        if (ballX > playerX - 5 && ballX < playerX + playerWidth + 5) {
            let impactPoint = (ballX - (playerX + playerWidth / 2)) / (playerWidth / 2);
            ballSpeedX = impactPoint * (speed * 0.8);
            ballSpeedY = -speed;
            ballY = canvas.height - paddleHeight - ballRadius;
            triggerShake(8);
            playSFX(soundHit); 
            createParticles(ballX, canvas.height - paddleHeight, "#FFF");
            spawnPowerUp();
        }
    }

    if (ballSpeedY < 0 && ballY - ballRadius <= paddleHeight) {
        if (ballX > computerX - 5 && ballX < computerX + currentCompW + 5) {
            let impactPoint = (ballX - (computerX + currentCompW / 2)) / (currentCompW / 2);
            ballSpeedX = impactPoint * (speed * 0.8);
            ballSpeedY = speed;
            ballY = paddleHeight + ballRadius;
            triggerShake(8);
            playSFX(soundHit); 
            createParticles(ballX, paddleHeight, currentColor);
        }
    }

    if (ballY < 0 || ballY > canvas.height) {
        if (ballY < 0) {
            playerScore++; lastScorer = "player";
            goalMessage = `${playerName} FEZ GOL!`;
            triggerFlash(currentColor); playSFX(soundWin);
            if (playerScore >= winningScore && displayLevel === 6) gameOver = true;
        } else {
            computerScore++; lastScorer = "computer";
            goalMessage = "JACK FEZ O GOL!";
            triggerFlash("#FF0000"); playSFX(soundLose);
        }
        goalTimer = 60; 
        if (playerScore >= winningScore || computerScore >= winningScore) gameOver = true;
        else { gameStarted = false; resetBall(); }
    }
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    let currentColor = `hsl(${200 - (displayLevel * 30)}, 80%, 50%)`;
    let scoreColor = `hsla(${200 - (displayLevel * 30)}, 80%, 50%, 0.15)`;

    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1.0;

    ctx.font = "bold 150px Arial";
    ctx.fillStyle = scoreColor;
    ctx.textAlign = "center";
    ctx.fillText(computerScore, canvas.width / 2, canvas.height / 4 + 50);
    ctx.fillText(playerScore, canvas.width / 2, (canvas.height / 4) * 3 + 50);

    ctx.save();
    if (shakeIntensity > 0.5) {
        ctx.translate((Math.random()-0.5)*shakeIntensity, (Math.random()-0.5)*shakeIntensity);
    }

    if (goalTimer > 0 && !gameOver) {
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = (lastScorer === "player") ? "#0F0" : "#F00";
        ctx.fillText(goalMessage, canvas.width / 2, canvas.height / 2);
    }

    if (powerUp.active) {
        ctx.fillStyle = (powerUp.type === 'wide') ? "#0F0" : "#00FFFF"; 
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = ballSlowed ? "#00FFFF" : "#FFF";
    ballTrail.forEach((pos, i) => {
        ctx.globalAlpha = i / trailLength * 0.2;
        ctx.fillStyle = currentColor;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, ballRadius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.beginPath(); ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballSlowed ? "#00FFFF" : "#FFF"; ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = powerUpActive ? "#0F0" : "#FFF"; 
    ctx.fillRect(playerX, canvas.height - paddleHeight, playerWidth, paddleHeight);
    ctx.fillStyle = currentColor; 
    ctx.fillRect(computerX, 0, getEnemyWidth(), paddleHeight);
    
    ctx.restore();

    // --- PAUSA  TESTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TESTE TESTE TESTE TESTE ---              PAUSA TESTE <
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 50px Courier New";
        ctx.fillText("JOGO PAUSADO", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText("Pressione ENTER para Continuar", canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillStyle = "#FF5555";
        ctx.fillText("Pressione ESC para Sair", canvas.width / 2, canvas.height / 2 + 80);
    }

    if (flashOpacity > 0) {
        ctx.strokeStyle = borderFlashColor;
        ctx.lineWidth = 40; ctx.globalAlpha = flashOpacity;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    if (!gameStarted && !gameOver && !isPaused) {
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.font = "bold 40px Arial";
        ctx.fillText(`NÍVEL ${displayLevel}`, canvas.width/2, canvas.height/2 - 40);
        ctx.font = "bold 25px Arial";
        ctx.fillText("PRESS SPACE BAR PARA COMEÇAR", canvas.width/2, canvas.height/2 + 30);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#888";
        ctx.fillText("ESC para Pausar", canvas.width/2, canvas.height - 20);
    }

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.95)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const venceuPartida = playerScore >= winningScore;
        if (venceuPartida && displayLevel === 6) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFD700"; ctx.font = "bold 60px Arial";
            ctx.fillText("Venceu o Jack!", canvas.width / 2, canvas.height / 2 - 50);
            ctx.fillStyle = "#FFF"; ctx.font = "25px Arial";
            ctx.fillText(`Parabéns, ${playerName}!`, canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText("Você derrotou o Jack!", canvas.width / 2, canvas.height / 2 + 45);
            ctx.font = "bold 20px Courier New"; ctx.fillStyle = "rgb(240, 244, 240)"; 
            ctx.fillText("--- Venceu o Jack ---", canvas.width / 2, canvas.height / 2 + 110);
            ctx.font = "18px Courier New"; ctx.fillStyle = "#FFF"; 
            ctx.fillText("Criação e Lógica: Jackson Schroeder", canvas.width / 2, canvas.height / 2 + 140);
            ctx.fillText("Design Visual: Jackson Schroeder", canvas.width / 2, canvas.height / 2 + 165);
            ctx.fillText("Trilha Sonora: Jsfxr (https://sfxr.me)", canvas.width / 2, canvas.height / 2 + 190);
            ctx.fillStyle = "#1acb14"; ctx.fillText("Obrigado por jogar!", canvas.width / 2, canvas.height / 2 + 230);
            ctx.font = "14px Arial"; ctx.fillStyle = "#888";
            ctx.fillText("PRESSIONE ESPAÇO PARA RECOMEÇAR A JORNADA", canvas.width / 2, canvas.height - 50);
        } else {
            ctx.fillStyle = venceuPartida ? "#00FF00" : "#FF0000";
            ctx.font = "bold 70px Arial"; ctx.textAlign = "center";
            ctx.fillText(venceuPartida ? "VITÓRIA!" : "DERROTA!", canvas.width/2, canvas.height/2);
            ctx.fillStyle = "#FFF"; ctx.font = "20px Arial";
            ctx.fillText(venceuPartida ? "Próximo nível vindo aí..." : "Não desista!", canvas.width/2, canvas.height/2 + 60);
        }
    }
}

function loop() { 
    if (inputActive) {
        drawNickScreen();
    } else {
        update(); 
        draw(); 
    }
    requestAnimationFrame(loop); 
}

loop();



// ideias, deixar o player escolher a cor da raquete no menu principal ?
// portar depois de finalizado par mobile ? 
// fazer cores diferentes para cada nivel no campo? 