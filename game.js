const canvas = document.getElementById("pongCanvas");

const ctx = canvas.getContext("2d");



canvas.width = 600;  

canvas.height = 900;



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

let playerWidth = 110; // tamanho da raquete

let powerUpActive = false; // para saber se o poderzinho ta ativo

let powerUpTimer = 0;



// --- bola ---

let ballRadius = 10;

let ballX = 300, ballY = 450;

let ballSpeedX = 0, ballSpeedY = 0;

let ballTrail = [];

const trailLength = 8;

let ballSlowed = false; // bola lenta

let ballSlowTimer = 0;   // tempo bola lenta



function getLevelSpeed() {

    // para ajudar velocidade da bola

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



// --- poderzinhossss ---

let powerUp = { x: 0, y: 0, active: false, size: 20, speed: 3, type: '' }; // Type: 'wide' ou 'slow'



function spawnPowerUp() {

    // 10% de chance de spawnar um power-up ?????                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if (Math.random() < 0.10 && !powerUp.active) {

        powerUp.x = Math.random() * (canvas.width - powerUp.size);

        powerUp.y = 0;

        powerUp.active = true;

        // 50% para cair cada poderzinho

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

   

    // resetar os poderzinho

    playerWidth = basePaddleWidth;

    powerUpActive = false;

    powerUpTimer = 0;

    ballSlowed = false;

    ballSlowTimer = 0;

    powerUp.active = false; // eemove poderzinho caindo



    let speed = getLevelSpeed();

    ballSpeedY = (lastScorer === "player" ? -speed : speed);

    ballSpeedX = (Math.random() - 0.5) * 4;

    computerErrorX = 0;

}



window.addEventListener("keydown", (e) => {

    keys[e.key.toLowerCase()] = true;

    if (e.code === "Space") {

        if (gameOver) {

            displayLevel = (playerScore >= winningScore) ? Math.min(6, displayLevel + 1) : 1;

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

    if (!gameStarted || gameOver) return;

   

    if (shakeIntensity > 0) shakeIntensity *= 0.9;

    if (flashOpacity > 0) flashOpacity -= 0.02;



    // tempo do raquetão "(poder)"

    if (powerUpActive) {

        powerUpTimer--;

        if (powerUpTimer <= 0) {

            powerUpActive = false;

            playerWidth = basePaddleWidth;

        }

    }



    // tempo da bola lenta

    if (ballSlowed) {

        ballSlowTimer--;

        if (ballSlowTimer <= 0) {

            ballSlowed = false;

            // reajustar a velocidade da bola

            let currentSpeed = getLevelSpeed();

            ballSpeedY = Math.sign(ballSpeedY) * currentSpeed;

            ballSpeedX = Math.sign(ballSpeedX) * currentSpeed;

        }

    }





    // movimentação do poderzinho caindo

    if (powerUp.active) {

        powerUp.y += powerUp.speed;

        // colisão com raquete player

        if (powerUp.y + powerUp.size > canvas.height - paddleHeight &&

            powerUp.x > playerX && powerUp.x < playerX + playerWidth) {

           

            powerUp.active = false; // coletar!



            if (powerUp.type === 'wide') {

                powerUpActive = true;

                playerWidth = basePaddleWidth * 1.6;

                powerUpTimer = 420; // 7 !!

                triggerFlash("#00FF00"); // verde da raquete

            } else if (powerUp.type === 'slow') {

                ballSlowed = true;

                ballSlowTimer = 360; // 6 ?? ~~~!~~~~

                // reajuste bola lenta

                let slowSpeed = getLevelSpeed();

                ballSpeedY = Math.sign(ballSpeedY) * slowSpeed;

                ballSpeedX = Math.sign(ballSpeedX) * slowSpeed; // apara aplica também ao X

                triggerFlash("#00FFFF"); // flash para Bola Lenta

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



    // --- ia humanizada --

    let currentCompW = getEnemyWidth();

    if (ballSpeedY < 0 && ballY < canvas.height * 0.7) {

       

       

        // lentidão da bola também afeta o inimigo

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

    }



    let speed = getLevelSpeed(); // Pega a velocidade atual (normal ou lenta)

    let currentColor = `hsl(${200 - (displayLevel * 30)}, 80%, 50%)`;



    // colisão do jogador

    if (ballSpeedY > 0 && ballY + ballRadius >= canvas.height - paddleHeight) {

        if (ballX > playerX - 5 && ballX < playerX + playerWidth + 5) {

            let impactPoint = (ballX - (playerX + playerWidth / 2)) / (playerWidth / 2);

            ballSpeedX = impactPoint * (speed * 0.8);

            ballSpeedY = -speed;

            ballY = canvas.height - paddleHeight - ballRadius;

            triggerShake(8);

            spawnPowerUp();

        }

    }



    // colisão inimigo

    if (ballSpeedY < 0 && ballY - ballRadius <= paddleHeight) {

        if (ballX > computerX - 5 && ballX < computerX + currentCompW + 5) {

            let impactPoint = (ballX - (computerX + currentCompW / 2)) / (currentCompW / 2);

            ballSpeedX = impactPoint * (speed * 0.8);

            ballSpeedY = speed;

            ballY = paddleHeight + ballRadius;

            triggerShake(8);

        }

    }



    if (ballY < 0 || ballY > canvas.height) {

        if (ballY < 0) {

            playerScore++; lastScorer = "player";

            triggerFlash(currentColor);

        } else {

            computerScore++; lastScorer = "computer";

            triggerFlash("#FF0000");

        }

        if (playerScore >= winningScore || computerScore >= winningScore) gameOver = true;

        else { gameStarted = false; resetBall(); }

    }

}



function draw() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(0, 0, canvas.width, canvas.height);



    let currentColor = `hsl(${200 - (displayLevel * 30)}, 80%, 50%)`;

    let scoreColor = `hsla(${200 - (displayLevel * 30)}, 80%, 50%, 0.15)`;



    ctx.font = "bold 150px Arial";

    ctx.fillStyle = scoreColor;

    ctx.textAlign = "center";

    ctx.fillText(computerScore, canvas.width / 2, canvas.height / 4 + 50);

    ctx.fillText(playerScore, canvas.width / 2, (canvas.height / 4) * 3 + 50);



    ctx.save();

    if (shakeIntensity > 0.5) {

        ctx.translate((Math.random()-0.5)*shakeIntensity, (Math.random()-0.5)*shakeIntensity);

    }



    // desenho dos poderzinhos

    if (powerUp.active) {

        ctx.fillStyle = (powerUp.type === 'wide') ? "#0F0" : "#00FFFF"; // Verde ou Ciano

        ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);

    }



    // rastro da bola

    ballTrail.forEach((pos, i) => {

        ctx.globalAlpha = i / trailLength * 0.2;

        ctx.fillStyle = currentColor;

        ctx.beginPath();

        ctx.arc(pos.x, pos.y, ballRadius, 0, Math.PI * 2);

        ctx.fill();

    });

    ctx.globalAlpha = 1.0;



    // bola azul freezada

    ctx.beginPath();

    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);

    ctx.fillStyle = ballSlowed ? "#00FFFF" : "#FFF"; // Ciano se lenta, Branco se normal

    ctx.fill();





    // raquetes

    ctx.fillStyle = powerUpActive ? "#0F0" : "#FFF"; // Raquete Player

    ctx.fillRect(playerX, canvas.height - paddleHeight, playerWidth, paddleHeight);

   

    ctx.fillStyle = currentColor; // Raquete Jack

    ctx.fillRect(computerX, 0, getEnemyWidth(), paddleHeight);

   

    ctx.restore();



    // ui estatica

    if (flashOpacity > 0) {

        ctx.strokeStyle = borderFlashColor;

        ctx.lineWidth = 40;

        ctx.globalAlpha = flashOpacity;

        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 1.0;

    }



    if (!gameStarted && !gameOver) {

        ctx.fillStyle = "#FFF";

        ctx.textAlign = "center";

        ctx.font = "bold 40px Arial";

        ctx.fillText(`NÍVEL ${displayLevel}`, canvas.width/2, canvas.height/2 - 40);

        ctx.font = "bold 25px Arial";

        ctx.fillText("PRESS SPACE BAR PARA COMEÇAR", canvas.width/2, canvas.height/2 + 30);

    }



    if (gameOver) {

        ctx.fillStyle = "rgba(0,0,0,0.9)";

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = (playerScore >= winningScore) ? "#00FF00" : "#FF0000";

        ctx.font = "bold 70px Arial";

        ctx.textAlign = "center";

        ctx.fillText(playerScore >= winningScore ? "VITÓRIA!" : "DERROTA!", canvas.width/2, canvas.height/2);

    }

}



function loop() { update(); draw(); requestAnimationFrame(loop); }

loop();