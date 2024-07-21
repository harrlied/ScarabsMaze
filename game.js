const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_SIZE = 2000;
const BLOCK_SIZE = 500;
const TILE_SIZE = 100;
const VISIBLE_TILES = 7;
const VISIBLE_SIZE = VISIBLE_TILES * TILE_SIZE;

canvas.width = VISIBLE_SIZE;
canvas.height = VISIBLE_SIZE;

let gameArea = [];
let playerX = GAME_SIZE / 2;
let playerY = GAME_SIZE / 2;
let isMoving = false;

// Tetris-palikoiden muodot (7 erilaista)
const tetrisPieces = [
    [[1,1],[1,1]],
    [[1,1,1,1]],
    [[1,1,1],[0,1,0]],
    [[1,1,1],[1,0,0]],
    [[1,1,1],[0,0,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
];

// Lataa kuvat
const images = {};
for (let i = 0; i <= 17; i++) {
    const img = new Image();
    img.src = `images/tile_${i.toString().padStart(2, '0')}.png`;
    images[i] = img;
}

const playerImage = new Image();
playerImage.src = 'images/turtle_01.png';

const jewelImages = [];
for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `images/jewel_${i.toString().padStart(2, '0')}.png`;
    jewelImages.push(img);
}

const monsterImages = [];
for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `images/scarab${i}.png`;
    monsterImages.push(img);
}

// Luo pelialue
for (let y = 0; y < GAME_SIZE / BLOCK_SIZE; y++) {
    for (let x = 0; x < GAME_SIZE / BLOCK_SIZE; x++) {
        gameArea.push(createBlock());
    }
}

function createBlock() {
    let block = Array(25).fill(0);

    // Valitse satunnainen Tetris-palikka ja sen asento
    let piece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    let rotation = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotation; i++) {
        piece = rotatePiece(piece);
    }

    // Sijoita palikka satunnaiseen kohtaan lohkossa
    let startX = Math.floor(Math.random() * (5 - piece[0].length + 1));
    let startY = Math.floor(Math.random() * (5 - piece.length + 1));

    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                let index = (startY + y) * 5 + (startX + x);
                block[index] = Math.floor(Math.random() * 17) + 1;
            }
        }
    }

    return block;
}

function rotatePiece(piece) {
    return piece[0].map((_, index) => piece.map(row => row[index]).reverse());
}

// Sijoita jalokivet ja monsterit
let jewelPositions = [];
let monsterPositions = [];

function placeObjects() {
    jewelPositions = [];
    monsterPositions = [];
    let availableBlocks = [...Array(16).keys()];

    // Sijoita jalokivet
    for (let i = 0; i < 12 && availableBlocks.length > 0; i++) {
        let index = Math.floor(Math.random() * availableBlocks.length);
        let position = availableBlocks[index];
        jewelPositions.push(position);
        availableBlocks.splice(index, 1);
    }

    // Sijoita monsterit
    for (let i = 0; i < 12 && availableBlocks.length > 0; i++) {
        let index = Math.floor(Math.random() * availableBlocks.length);
        let position = availableBlocks[index];
        monsterPositions.push(position);
        availableBlocks.splice(index, 1);
    }
}

placeObjects();

function isValidPosition(x, y) {
    let blockX = Math.floor(x / BLOCK_SIZE);
    let blockY = Math.floor(y / BLOCK_SIZE);
    let tileX = Math.floor((x % BLOCK_SIZE) / TILE_SIZE);
    let tileY = Math.floor((y % BLOCK_SIZE) / TILE_SIZE);
    let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;
    let tileIndex = tileY * 5 + tileX;

    // Tarkista, onko ruudussa muuri
    if (gameArea[blockIndex][tileIndex] !== 0) return false;

    // Tarkista, onko ruutu liian lähellä pelaajaa
    let playerBlockX = Math.floor(playerX / BLOCK_SIZE);
    let playerBlockY = Math.floor(playerY / BLOCK_SIZE);
    let playerTileX = Math.floor((playerX % BLOCK_SIZE) / TILE_SIZE);
    let playerTileY = Math.floor((playerY % BLOCK_SIZE) / TILE_SIZE);

    let dx = Math.abs(blockX * 5 + tileX - (playerBlockX * 5 + playerTileX));
    let dy = Math.abs(blockY * 5 + tileY - (playerBlockY * 5 + playerTileY));
    if (dx <= 2 && dy <= 2) return false;

    return true;
}

function drawGame() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let startX = Math.floor(playerX / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);
    let startY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);

    for (let y = 0; y < VISIBLE_TILES; y++) {
        for (let x = 0; x < VISIBLE_TILES; x++) {
            let tileX = (startX + x + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);
            let tileY = (startY + y + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);

            let blockX = Math.floor(tileX / (BLOCK_SIZE / TILE_SIZE));
            let blockY = Math.floor(tileY / (BLOCK_SIZE / TILE_SIZE));
            let tileIndex = (tileY % (BLOCK_SIZE / TILE_SIZE)) * (BLOCK_SIZE / TILE_SIZE) + (tileX % (BLOCK_SIZE / TILE_SIZE));

            let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;
            let tileType = gameArea[blockIndex][tileIndex];

            ctx.drawImage(images[tileType], x * TILE_SIZE, y * TILE_SIZE);

            // Piirrä jalokivet ja monsterit
            if (tileType === 0) {
                let jewelIndex = jewelPositions.indexOf(blockIndex);
                if (jewelIndex !== -1) {
                    ctx.drawImage(jewelImages[jewelIndex], x * TILE_SIZE, y * TILE_SIZE);
                }

                let monsterIndex = monsterPositions.indexOf(blockIndex);
                if (monsterIndex !== -1) {
                    ctx.drawImage(monsterImages[monsterIndex % 6], x * TILE_SIZE, y * TILE_SIZE);
                }
            }
        }
    }

    // Piirrä pelaaja keskelle ruutua
    ctx.drawImage(playerImage, Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2), Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));
}

function movePlayer(dx, dy) {
    if (isMoving) return;
    isMoving = true;

    let targetX = playerX + dx * TILE_SIZE;
    let targetY = playerY + dy * TILE_SIZE;
    let steps = 10;
    let stepX = dx * TILE_SIZE / steps;
    let stepY = dy * TILE_SIZE / steps;

    function animate() {
        playerX += stepX;
        playerY += stepY;

        playerX = (playerX + GAME_SIZE) % GAME_SIZE;
        playerY = (playerY + GAME_SIZE) % GAME_SIZE;

        drawGame();

        if (--steps > 0) {
            requestAnimationFrame(animate);
        } else {
            isMoving = false;
        }
    }

    animate();
}

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});

// Aloita peli
Promise.all([...Object.values(images), playerImage, ...jewelImages, ...monsterImages].map(img => new Promise(resolve => img.onload = resolve)))
    .then(() => {
        drawGame();
    });