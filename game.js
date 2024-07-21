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
// let jewelPositions = [];
// let monsterPositions = [];

let playerX = GAME_SIZE / 2 + TILE_SIZE * 2; // Keskimmäisen lohkon keskikohta
let playerY = GAME_SIZE / 2 + TILE_SIZE * 2;
let isMoving = false;

// Tetris-palikoiden muodot (7 erilaista)
const tetrisPieces = [
    [
        [0,0,0,0,0],
        [0,1,1,1,1],
        [0,0,0,0,0],
        [0,1,0,0,1],
        [0,1,0,0,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,1],
        [0,0,0,0,0],
        [0,1,0,1,1],
        [0,1,0,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,1],
        [0,1,0,0,0],
        [0,0,0,1,1],
        [0,1,1,1,1]
    ],
    [
        [0,1,1,1,1],
        [0,1,0,0,1],
        [0,1,0,0,1],
        [0,1,0,1,1],
        [0,0,0,0,0]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,0,0],
        [0,1,0,0,0],
        [0,0,0,0,1],
        [0,0,0,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,0,1],
        [0,0,0,0,1],
        [0,1,0,0,0],
        [0,1,0,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,0,0,1],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,1,0,0,1]
    ],
    [
        [0,1,1,1,1],
        [0,1,0,0,1],
        [0,1,0,0,1],
        [0,1,0,0,1],
        [0,0,0,0,0]
    ],
    [
        [0,0,0,0,0],
        [0,1,0,1,0],
        [0,1,0,1,0],
        [0,1,0,1,0],
        [0,1,0,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,0,1],
        [0,1,0,0,1],
        [0,1,0,0,1],
        [0,1,0,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,0,0,1],
        [0,1,0,1,1],
        [0,1,0,1,1],
        [0,1,0,0,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,0],
        [0,1,1,1,0],
        [0,1,1,1,0],
        [0,0,0,0,0]
    ],
    [
        [0,0,0,0,0],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [0,1,1,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,1],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,1,1,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,1,1,1,1]
    ],
    [
        [0,0,0,0,0],
        [0,1,1,1,0],
        [0,1,0,0,0],
        [0,1,0,0,0],
        [0,1,1,1,1]
    ]
];

// Lataa kuvat
const images = {};
for (let i = 0; i <= 17; i++) {
    const img = new Image();
    img.src = `images/tile_${i.toString().padStart(2, '0')}.png`;
    images[i] = img;
}

// Lisää tämä rivi
images['start'] = new Image();
images['start'].src = 'images/start_screen.png';



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
        if (x === 2 && y === 2) {
            // Keskimmäinen lohko (pelaajan aloitusalue)
            gameArea.push(Array(25).fill(0));
        } else {
            gameArea.push(createBlock());
        }
    }
}

function createBlock() {
    let block = Array(25).fill(0);

    let piece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    let rotation = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotation; i++) {
        piece = rotatePiece(piece);
    }

    // Aloituskohta on aina (0,0)
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (piece[y][x]) {
                let index = y * 5 + x;
                block[index] = Math.floor(Math.random() * 17) + 1;
            }
        }
    }

    return block;
}

function rotatePiece(piece) {
    let rotated = Array(5).fill().map(() => Array(5).fill(0));
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            rotated[x][4-y] = piece[y][x];
        }
    }
    return rotated;
}

// Sijoita jalokivet ja monsterit
let jewelPositions = [];
let monsterPositions = [];

function placeObjects() {
    jewelPositions = [];
    monsterPositions = [];
    let availableBlocks = [...Array(16).keys()];

    console.log("Sijoitetaan jalokiviä ja monstereita...");

    // Sijoita 12 jalokiveä
    for (let i = 0; i < 12 && availableBlocks.length > 0; i++) {
        let attempts = 0;
        let placed = false;
        while (!placed && attempts < 100) {
            let index = Math.floor(Math.random() * availableBlocks.length);
            let blockIndex = availableBlocks[index];
            let x = Math.floor(Math.random() * 5);
            let y = Math.floor(Math.random() * 5);
            if (isValidPosition(blockIndex * BLOCK_SIZE + x * TILE_SIZE, Math.floor(blockIndex / 4) * BLOCK_SIZE + y * TILE_SIZE)) {
                jewelPositions.push({block: blockIndex, x: x, y: y});
                console.log(`Jalokivi sijoitettu: block ${blockIndex}, x ${x}, y ${y}`);
                placed = true;
            }
            attempts++;
        }
        if (!placed) {
            console.log(`Ei voitu sijoittaa jalokiveä ${i}`);
        }
    }

    // Sijoita 12 monsteria (2 kutakin tyyppiä)
    availableBlocks = [...Array(16).keys()]; // Reset available blocks
    for (let i = 0; i < 12 && availableBlocks.length > 0; i++) {
        let attempts = 0;
        let placed = false;
        while (!placed && attempts < 100) {
            let index = Math.floor(Math.random() * availableBlocks.length);
            let blockIndex = availableBlocks[index];
            let x = Math.floor(Math.random() * 5);
            let y = Math.floor(Math.random() * 5);
            if (isValidPosition(blockIndex * BLOCK_SIZE + x * TILE_SIZE, Math.floor(blockIndex / 4) * BLOCK_SIZE + y * TILE_SIZE)) {
                monsterPositions.push({block: blockIndex, x: x, y: y, type: Math.floor(i / 2)});
                console.log(`Monsteri sijoitettu: block ${blockIndex}, x ${x}, y ${y}, type ${Math.floor(i / 2)}`);
                placed = true;
            }
            attempts++;
        }
        if (!placed) {
            console.log(`Ei voitu sijoittaa monsteria ${i}`);
        }
    }

    console.log(`Sijoitettu ${jewelPositions.length} jalokiveä ja ${monsterPositions.length} monsteria.`);
}

// placeObjects();

function isValidPosition(x, y) {
    let blockX = Math.floor(x / BLOCK_SIZE);
    let blockY = Math.floor(y / BLOCK_SIZE);
    let tileX = Math.floor((x % BLOCK_SIZE) / TILE_SIZE);
    let tileY = Math.floor((y % BLOCK_SIZE) / TILE_SIZE);

    // Varmista, että olemme pelialueen sisällä
    blockX = (blockX + GAME_SIZE / BLOCK_SIZE) % (GAME_SIZE / BLOCK_SIZE);
    blockY = (blockY + GAME_SIZE / BLOCK_SIZE) % (GAME_SIZE / BLOCK_SIZE);

    let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;
    let tileIndex = tileY * 5 + tileX;

    console.log(`Tarkistetaan positio: blockX ${blockX}, blockY ${blockY}, tileX ${tileX}, tileY ${tileY}, blockIndex ${blockIndex}, tileIndex ${tileIndex}`);

    // Tarkista, onko positio keskuslohkossa
    if (blockX === 2 && blockY === 2) {
        return false; // Ei sallita objekteja keskuslohkoon
    }

    // Tarkista, onko blockIndex validi
    if (blockIndex < 0 || blockIndex >= gameArea.length) {
        console.log("Positio hylätty: invalid blockIndex");
        return false;
    }

    // Tarkista, onko ruudussa muuri
    if (!gameArea[blockIndex] || gameArea[blockIndex][tileIndex] !== 0) {
        console.log("Positio hylätty: muuri tai invalid tileIndex");
        return false;
    }

    // Tarkista, onko ruutu liian lähellä pelaajaa
    let playerBlockX = Math.floor(playerX / BLOCK_SIZE);
    let playerBlockY = Math.floor(playerY / BLOCK_SIZE);
    let playerTileX = Math.floor((playerX % BLOCK_SIZE) / TILE_SIZE);
    let playerTileY = Math.floor((playerY % BLOCK_SIZE) / TILE_SIZE);

    let dx = Math.abs(blockX * 5 + tileX - (playerBlockX * 5 + playerTileX));
    let dy = Math.abs(blockY * 5 + tileY - (playerBlockY * 5 + playerTileY));
    if (dx <= 2 && dy <= 2) {
        console.log("Positio hylätty: liian lähellä pelaajaa");
        return false;
    }

    // Tarkista, onko ruudussa jo jalokivi tai monsteri
    for (let jewel of jewelPositions) {
        if (jewel.block === blockIndex && jewel.x === tileX && jewel.y === tileY) {
            console.log("Positio hylätty: jo jalokivi");
            return false;
        }
    }
    for (let monster of monsterPositions) {
        if (monster.block === blockIndex && monster.x === tileX && monster.y === tileY) {
            console.log("Positio hylätty: jo monsteri");
            return false;
        }
    }

    console.log("Positio hyväksytty");
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
            let tileIndex = (tileY % (BLOCK_SIZE / TILE_SIZE)) * 5 + (tileX % (BLOCK_SIZE / TILE_SIZE));

            let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;

            // Tarkista, onko kyseessä aloituslohko
            if (blockX === 2 && blockY === 2) {
                // Laske aloituskuvan oikea sijainti
                let startScreenX = x * TILE_SIZE - (tileX % 5) * TILE_SIZE;
                let startScreenY = y * TILE_SIZE - (tileY % 5) * TILE_SIZE;
                ctx.drawImage(images['start'], startScreenX, startScreenY);
            } else {
                let tileType = gameArea[blockIndex][tileIndex];
                ctx.drawImage(images[tileType], x * TILE_SIZE, y * TILE_SIZE);

                // Piirrä jalokivet ja monsterit
                if (tileType === 0) {
                    let jewel = jewelPositions.find(j => j.block === blockIndex && j.x === tileX % 5 && j.y === tileY % 5);
                    if (jewel) {
                        ctx.drawImage(jewelImages[jewelPositions.indexOf(jewel)], x * TILE_SIZE, y * TILE_SIZE);
                    }

                    let monster = monsterPositions.find(m => m.block === blockIndex && m.x === tileX % 5 && m.y === tileY % 5);
                    if (monster) {
                        ctx.drawImage(monsterImages[monster.type], x * TILE_SIZE, y * TILE_SIZE);
                    }
                }
            }
        }
    }

    // Piirrä pelaaja keskelle ruutua
    ctx.drawImage(playerImage, Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2), Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));
}

// Aloita peli
Promise.all([...Object.values(images), playerImage, ...jewelImages, ...monsterImages].map(img => new Promise(resolve => img.onload = resolve)))
    .then(() => {
        placeObjects();
        drawGame();
    });

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
        placeObjects();
        drawGame();
    });
