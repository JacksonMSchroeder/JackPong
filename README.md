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