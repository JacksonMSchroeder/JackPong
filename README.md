# JackPong
Estudo, fazer um pong e trabalhar com ideias para aprimoração 


Meu segundo game, o primeiro foi chamado de ghostcat, fiz para tcc de um curso de programações de jogos da WEB, um jogo simples de plataforma.

Esse game apesar de simples fui adaptando ideias e refinando ele, comecei com um campo horizontal e com grande dificuldades com a física da bola, ai fui trabalho no cod até chegar num nivel aceitavel, mas ai, me deu a ideia e o desafio de voltar o campo para vertical, e foi um processo até que traquilo no geral tirando algumas partes.

as maiores dificuldades que enfrentei foi com física da bola e IA do inimigo, adaptei a ia inimiga algumas vezes para ficar um desafio bom e crescente... 
fiz um trabalho com cores, com tamanho do inimigo, e fui colocando e discartando ideias ao longo do projeto, como por exemplo, colocar um multiplicador de vel no inimigo, no fim acho que o desafio ficou melhor aumentando o tamanho da raquete do inimigo 




///////////////////=/////////////////////////
PARA MUDAR O CAMPO, VERTical 

canvas.width = 600; canvas.height = 1200;


Controles DA RAQUETE
if ((keys["a"] || keys["arrowleft"]) && playerX > 0) playerX -= playerSpeed;
if ((keys["d"] || keys["arrowright"]) && playerX < canvas.width - basePaddleWidth) playerX += playerSpeed;

Colisões de Parede e Raquete
if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) ballSpeedX *= -1;

if (ballY + ballRadius >= canvas.height - paddleWidth && ballX > playerX && ballX < playerX + basePaddleWidth) {
    ballSpeedY = -getLevelSpeed(); ballY = canvas.height - paddleWidth - ballRadius;
}
if (ballY - ballRadius <= paddleWidth && ballX > computerX && ballX < computerX + currentCompW) {
    ballSpeedY = getLevelSpeed(); ballY = paddleWidth + ballRadius;
}
///////////////////////// 







FORMA DAS RAQUETES 
ctx.fillRect(playerX, canvas.height - paddleWidth, basePaddleWidth, paddleWidth); // Player
ctx.fillRect(computerX, 0, currentCompW, paddleWidth); // 











//////////////////////////////////==///////////////////

humanizar a raquete inimiga 

let currentCompW = getEnemyWidth();
   (ballSpeedY < 0)
if (ballSpeedY < 0 && ballY < canvas.height * 0.7) {
    
 
    let computerAgility = 1.8 + (displayLevel * 0.5); 
    
    let targetX = ballX - (currentCompW / 2) + computerErrorX;
     if (Math.abs(computerX - targetX) > 10) {
        if (computerX < targetX) computerX += computerAgility;
        else if (computerX > targetX) computerX -= computerAgility;
    }
}






//////////////////////////////////// === ///////////////////////////////

para o saque sair reto ( ta dando problema de sair muito pro lado e sair gol logo no inicio)


    // - ---
    ballSpeedY = (lastScorer === "player" ? -speed : speed);
    ballSpeedX = 0; // <--- 
    // -----------------------



    /////////////////// == //////////////////////////

    SONS DO JOGO ( site jsfrx)

    
const soundHit = new Audio('bateuraquete.wav'); // ou .mp3, veja a extensão do arquivo
const soundWin = new Audio('fezgol.wav'); 
const soundLose = new Audio('tomougol.wav'); 

function playSFX(audio) {
    audio.currentTime = 0; 
    audio.play().catch(e => console.log("Som aguardando Nick..."));
}





///////////////////==//////////////////////

INVESTIGAR!!!  sempre que tento adicionar um poder como bola curva, ou efeitos de campo o jogo  CRASH ou não abre, ou freeza, estudar e entender motivo !!!

// ---!!!!!!!!!! SISTEMA DE PODERES !!!!!!!!!!!---

 controla o poderzinho que cai 
let powerUp = { 
    x: 0, 
    y: 0, 
    active: false, // Indica se o item está visível na tela caindo
    size: 20, 
    speed: 3, 
    type: ''       // Pode ser 'wide' (raquete grande) ou 'slow' (bola lenta)
}; 

function spawnPowerUp() {
     poder vai aparecer (10% de chance) >hit bola<
    if (Math.random() < 0.10 && !powerUp.active) {
        powerUp.x = Math.random() * (canvas.width - powerUp.size); // Posição X aleatória
        powerUp.y = 0; // Começa no topo da tela
        powerUp.active = true; // Ativa a queda
        // Sorteia 50% de chance para cada tipo de poder
        powerUp.type = Math.random() < 0.5 ? 'wide' : 'slow';
    }
}

// :
function updatePowerUpLogic() {
    if (powerUp.active) {
        powerUp.y += powerUp.speed; // Faz o quadradinho descer

        // Verifica se o jogador "pegou" o poder com a raquete
        if (powerUp.y + powerUp.size > canvas.height - paddleHeight &&
            powerUp.x > playerX && powerUp.x < playerX + playerWidth) {
            
            powerUp.active = false; // Remove o item da tela

            raquetão
            if (powerUp.type === 'wide') {
                powerUpActive = true; 
                playerWidth = basePaddleWidth * 1.6; // Aumenta a raquete em 60%
                powerUpTimer = 420; // Duração de 7 segundos (60 frames * 7)
                triggerFlash("#00FF00"); // Pisca a tela em verde
            } 
             bola Lenta 
            else if (powerUp.type === 'slow') {
                ballSlowed = true;
                ballSlowTimer = 360; // Duração de 6 segundos
                let slowSpeed = getLevelSpeed(); // Aplica a velocidade reduzida
                ballSpeedY = Math.sign(ballSpeedY) * slowSpeed;
                ballSpeedX = Math.sign(ballSpeedX) * slowSpeed; 
                triggerFlash("#00FFFF"); // Pisca a tela em ciano
            }
        }
        
        // poder não ser considerado se não for pego
        if (powerUp.y > canvas.height) powerUp.active = false;
    }

    tempo raquetão
    if (powerUpActive) {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            powerUpActive = false;
            playerWidth = basePaddleWidth; // Volta ao tamanho normal
        }
    }

    bola Lenta
    if (ballSlowed) {
        ballSlowTimer--;
        if (ballSlowTimer <= 0) {
            ballSlowed = false; // Bola volta à velocidade normal do nível
        }
    }
}