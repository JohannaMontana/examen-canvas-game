const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const backgroundImg = new Image();
backgroundImg.src = 'images/fondo2.png'; // Ruta de la imagen de fondo

const cinnamorollImg = new Image();
cinnamorollImg.src = 'images/personaje.png';

const cloudImg = new Image();
cloudImg.src = 'images/nube.png';

const kuromiImg = new Image();
kuromiImg.src = 'images/kuromi.png';

const helloKittyImg = new Image();
helloKittyImg.src = 'images/helloykitty.png';

const pompompurinImg = new Image();
pompompurinImg.src = 'images/pompurin.png';

let clouds = [];
let friends = [
    { img: kuromiImg, name: 'Kuromi', rescued: false, appeared: false, count: 0 },
    { img: helloKittyImg, name: 'Hello Kitty', rescued: false, appeared: false, count: 0 },
    { img: pompompurinImg, name: 'Pompompurin', rescued: false, appeared: false, count: 0 }
];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

let cinnamoroll = {
    width: 50,
    height: 50,
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25, // Centro de la pantalla
    dy: 0,
    jumping: false,
    jumpStrength: 5,
    gravity: 0.2
};
document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const instructions = document.getElementById('instructions');
    const scoreboard = document.getElementById('scoreboard');
    const continueButton = document.getElementById('continueButton');

    // Evento que se dispara cuando se hace clic en el botón de "Continuar"
    continueButton.addEventListener('click', () => {
        instructions.classList.add('hidden');
        scoreboard.classList.remove('hidden');
        // Lógica para comenzar el juego aquí
    });
});

document.addEventListener('mousemove', moveCinnamoroll);

function moveCinnamoroll(event) {
    const rect = canvas.getBoundingClientRect();
    cinnamoroll.x = event.clientX - rect.left - cinnamoroll.width / 2;
}

function generateClouds() {
    let cloudsArray = [];
    for (let i = 0; i < 13; i++) {
        cloudsArray.push({
            x: Math.random() * (canvas.width - 100),
            y: Math.random() * (canvas.height - 100),
            width: 100,
            height: 60,
            dx: Math.random() < 0.5 ? -1 : 1 // Dirección aleatoria: izquierda (-1) o derecha (1)
        });
    }
    return cloudsArray;
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawCinnamoroll() {
    ctx.drawImage(cinnamorollImg, cinnamoroll.x, cinnamoroll.y, cinnamoroll.width, cinnamoroll.height);
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImg, cloud.x, cloud.y, cloud.width, cloud.height);
        cloud.x += cloud.dx; // Movimiento horizontal de la nube
        if (cloud.x + cloud.width < 0 || cloud.x > canvas.width) {
            // Si la nube sale del lienzo, la movemos al lado opuesto
            cloud.x = cloud.x + canvas.width * (cloud.dx > 0 ? -1 : 1);
        }
    });
}

function drawFriends() {
    friends.forEach(friend => {
        if (!friend.rescued && friend.appeared) {
            ctx.drawImage(friend.img, friend.x, friend.y, 50, 50);
        }
    });
}

function checkCollision() {
    for (let cloud of clouds) {
        if (
            cinnamoroll.y + cinnamoroll.height > cloud.y &&
            cinnamoroll.y < cloud.y + cloud.height &&
            cinnamoroll.x + cinnamoroll.width > cloud.x &&
            cinnamoroll.x < cloud.x + cloud.width
        ) {
            return true;
        }
    }
    return false;
}

function checkFriendCollision() {
    friends.forEach(friend => {
        if (
            cinnamoroll.x < friend.x + 50 &&
            cinnamoroll.x + cinnamoroll.width > friend.x &&
            cinnamoroll.y < friend.y + 50 &&
            cinnamoroll.y + cinnamoroll.height > friend.y &&
            !friend.rescued &&
            friend.appeared
        ) {
            friend.rescued = true;
            friend.count++;
            updateScoreboard();
            if (friends.every(f => f.rescued)) {
                gameOver = true;
                document.getElementById('gameStatus').innerText = '¡Has rescatado a todos tus amigos!';
            }
        }
    });
}

function update() {
    if (checkCollision() && !cinnamoroll.jumping) {
        cinnamoroll.jumping = true;
        cinnamoroll.dy = -cinnamoroll.jumpStrength;
    }

    cinnamoroll.y += cinnamoroll.dy;
    cinnamoroll.dy += cinnamoroll.gravity;

    if (cinnamoroll.y + cinnamoroll.height > canvas.height) {
        gameOver = true;
        cinnamoroll.y = canvas.height - cinnamoroll.height;
        cinnamoroll.dy = 0;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        document.getElementById('gameStatus').innerText = '¡Has perdido!';
    } else if (cinnamoroll.y < 0) {
        
        cinnamoroll.y = 0;
        cinnamoroll.dy = 0;
    }

    if (cinnamoroll.jumping && cinnamoroll.dy >= 0) {
        cinnamoroll.jumping = false;
    }

    if (!gameOver && !cinnamoroll.jumping) {
        score++;
    }

    // Movemos las nubes y dibujamos todos los elementos en el lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Dibujamos el fondo primero para que esté detrás de los demás elementos
    drawClouds();
    drawFriends();
    drawCinnamoroll();
    drawScore();

    // Comprobamos colisión con los amigos
    checkFriendCollision();

    // Solicitamos el próximo fotograma de animación
    if (!gameOver) requestAnimationFrame(update);
}

function drawScore() {
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = highScore;
}

function updateScoreboard() {
    document.getElementById('kuromiCount').innerText = friends.find(f => f.name === 'Kuromi').count;
    document.getElementById('helloKittyCount').innerText = friends.find(f => f.name === 'Hello Kitty').count;
    document.getElementById('pompompurinCount').innerText = friends.find(f => f.name === 'Pompompurin').count;
}

function appearFriend() {
    let interval = setInterval(() => {
        let availableFriends = friends.filter(f => !f.appeared);
        if (availableFriends.length > 0) {
            let friend = availableFriends[Math.floor(Math.random() * availableFriends.length)];
            friend.x = Math.random() * (canvas.width - 50);
            friend.y = Math.random() * (canvas.height - 50);
            friend.appeared = true;
        } else {
            clearInterval(interval); // Detenemos el intervalo una vez que todos los amigos hayan aparecido
        }
    }, 3000); // Intervalo ajustado para que los amigos aparezcan más rápido
}

backgroundImg.onload = () => {
    clouds = generateClouds();
    appearFriend();
    update();
};

// Evento de reinicio del juego al hacer clic en el botón de "Restart"
document.getElementById('restartButton').addEventListener('click', () => {
    score = 0;
    highScore = localStorage.getItem('highScore') || 0;
    gameOver = false;
    cinnamoroll = {
        width: 50,
        height: 50,
        x: canvas.width / 2 - 25,
        y: canvas.height / 2 - 25,
        dy: 0,
        jumping: false,
        jumpStrength: 10,
        gravity: 0.5
    };
    clouds = generateClouds();
    friends.forEach(friend => {
        friend.rescued = false;
        friend.appeared = false;
        friend.count = 0;
    });
    appearFriend();
    update();
});