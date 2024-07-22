const jewelImages = [];
for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `images/jewel_${i.toString().padStart(2, '0')}.png`;
    jewelImages.push(img);
}

const GAME_SIZE = 2000;
const BLOCK_SIZE = 500;
const TILE_SIZE = 100;
const VISIBLE_TILES = 7;
const VISIBLE_SIZE = VISIBLE_TILES * TILE_SIZE;

const canvas = document.createElement('canvas');
canvas.width = VISIBLE_SIZE;
canvas.height = VISIBLE_SIZE;
document.getElementById('gameArea').appendChild(canvas);
const ctx = canvas.getContext('2d');

const JEWEL_BAR_HEIGHT = 60;
canvas.width = VISIBLE_SIZE;
canvas.height = VISIBLE_SIZE + 2 * JEWEL_BAR_HEIGHT;

let gameArea = [];

let playerX = GAME_SIZE / 2 + TILE_SIZE * 2; // Keskimmäisen lohkon keskikohta
let playerY = GAME_SIZE / 2 + TILE_SIZE * 2;
let isMoving = false;

let collectedJewels = new Array(jewelImages.length).fill(false);

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

images['start'] = new Image();
images['start'].src = 'images/start_screen.png';

const playerImage = new Image();
playerImage.src = 'images/turtle_01.png';

const jewelBarImage = new Image();
jewelBarImage.src = 'images/jewel_bar.png';

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

function createMonster(block, x, y, type) {
    return {
        block: block,
        x: x,
        y: y,
        type: type,
        awake: false,
        moving: false,
        moveTimer: null
    };
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

// Lisää monsterPositions-taulukkoon 'awake' ja 'moving' ominaisuudet
monsterPositions = monsterPositions.map(monster => ({...monster, awake: false, moving: false}));

function wakeUpMonster(monster) {
    if (monster.awake) return;
    monster.awake = true;
    scheduleMonsterMove(monster);
}

function scheduleMonsterMove(monster) {
    if (monster.moveTimer) clearTimeout(monster.moveTimer);
    monster.moveTimer = setTimeout(() => moveMonster(monster), 2000);
}


function moveMonster(monster) {
    if (!monster.awake || monster.moving) {
        scheduleMonsterMove(monster);
        return;
    }

    monster.moving = true;

    let possibleMoves = getPossibleMoves(monster);

    if (possibleMoves.length === 0) {
        monster.moving = false;
        scheduleMonsterMove(monster);
        return;
    }

    let chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    let newX = Math.floor(monster.x) + chosenMove.x;
    let newY = Math.floor(monster.y) + chosenMove.y;

    // Käsittele lohkojen rajat
    if (newX < 0) newX = 4;
    if (newX > 4) newX = 0;
    if (newY < 0) newY = 4;
    if (newY > 4) newY = 0;

    console.log(`Monster ${monster.type} chose to move to x: ${newX}, y: ${newY}`);

    animateMonsterMove(monster, {x: newX, y: newY});
}

function isValidMonsterPosition(monster, newX, newY) {
    let globalX = (monster.block % 4) * 5 + newX;
    let globalY = Math.floor(monster.block / 4) * 5 + newY;

    globalX = (globalX + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);
    globalY = (globalY + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);

    let newBlock = Math.floor(globalY / 5) * 4 + Math.floor(globalX / 5);
    let tileX = globalX % 5;
    let tileY = globalY % 5;

    if (gameArea[newBlock][tileY * 5 + tileX] !== 0) return false;
    if (monsterPositions.some(m => m !== monster && m.block === newBlock && Math.floor(m.x) === tileX && Math.floor(m.y) === tileY)) return false;

    return true;
}


function getPossibleMoves(monster) {
    let moves = [
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0}
    ];

    return moves.filter(move => {
        let newX = Math.floor(monster.x) + move.x;
        let newY = Math.floor(monster.y) + move.y;

        // Käsittele lohkojen rajat
        if (newX < 0) newX = 4;
        if (newX > 4) newX = 0;
        if (newY < 0) newY = 4;
        if (newY > 4) newY = 0;

        let globalX = (monster.block % 4) * 5 + newX;
        let globalY = Math.floor(monster.block / 4) * 5 + newY;

        globalX = (globalX + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);
        globalY = (globalY + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);

        let newBlock = Math.floor(globalY / 5) * 4 + Math.floor(globalX / 5);
        let tileX = globalX % 5;
        let tileY = globalY % 5;

        if (gameArea[newBlock][tileY * 5 + tileX] !== 0) return false;
        if (monsterPositions.some(m => m !== monster && m.block === newBlock && Math.floor(m.x) === tileX && Math.floor(m.y) === tileY)) return false;

        return true;
    });
}

function animateMonsterMove(monster, newPos) {
    // console.log(`Starting animation for monster ${monster.type} from (${monster.x}, ${monster.y}) to (${newPos.x}, ${newPos.y})`);

    const steps = 20;
    const startX = monster.x;
    const startY = monster.y;
    const endX = newPos.x;
    const endY = newPos.y;
    let currentStep = 0;

    function animate() {
        currentStep++;
        const progress = currentStep / steps;
        let newX = startX + (endX - startX) * progress;
        let newY = startY + (endY - startY) * progress;

        // console.log(`Monster ${monster.type} animation step ${currentStep}: x: ${newX}, y: ${newY}`);

        monster.x = newX;
        monster.y = newY;
        updateMonsterBlock(monster);
        drawGame();

        if (currentStep < steps) {
            setTimeout(animate, 50);  // 50ms delay between steps
        } else {
            monster.x = Math.round(endX);
            monster.y = Math.round(endY);
            updateMonsterBlock(monster);
            monster.moving = false;
            // console.log(`Monster ${monster.type} finished moving. Final position: block ${monster.block}, x: ${monster.x}, y: ${monster.y}`);
            scheduleMonsterMove(monster);
            drawGame();
        }
    }

    animate();
}

function updateMonsterBlock(monster) {
    // console.log(`Updating block for monster ${monster.type}. Before: block ${monster.block}, x: ${monster.x}, y: ${monster.y}`);

    let newBlock = monster.block;
    let newX = monster.x;
    let newY = monster.y;

    // Käsittele x-koordinaatti
    if (newX < 0) {
        newX += 5;
        newBlock = (newBlock - 1 + 16) % 16;
    } else if (newX >= 5) {
        newX -= 5;
        newBlock = (newBlock + 1) % 16;
    }

    // Käsittele y-koordinaatti
    if (newY < 0) {
        newY += 5;
        newBlock = (newBlock - 4 + 16) % 16;
    } else if (newY >= 5) {
        newY -= 5;
        newBlock = (newBlock + 4) % 16;
    }

    // Varmista, että koordinaatit ovat aina välillä [0, 5)
    newX = (newX + 5) % 5;
    newY = (newY + 5) % 5;

    monster.block = newBlock;
    monster.x = newX;
    monster.y = newY;

    console.log(`After update: block ${monster.block}, x: ${monster.x}, y: ${monster.y}`);
}


function placeObjects() {
    jewelPositions = [];
    monsterPositions = [];
    let availableBlocks = [...Array(16).keys()].filter(i => i !== 10); // Poistetaan keskuslohko (2,2)

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
                placed = true;
            }
            attempts++;
        }
        if (!placed) {
            console.log(`Ei voitu sijoittaa jalokiveä ${i}`);
        }
    }

    // Sijoita 12 monsteria (2 kutakin tyyppiä)
    for (let i = 0; i < 12 && availableBlocks.length > 0; i++) {
        let attempts = 0;
        let placed = false;
        while (!placed && attempts < 100) {
            let index = Math.floor(Math.random() * availableBlocks.length);
            let blockIndex = availableBlocks[index];
            let x = Math.floor(Math.random() * 5);
            let y = Math.floor(Math.random() * 5);
            if (isValidPosition(blockIndex * BLOCK_SIZE + x * TILE_SIZE, Math.floor(blockIndex / 4) * BLOCK_SIZE + y * TILE_SIZE)) {
                monsterPositions.push(createMonster(blockIndex, x, y, Math.floor(i / 2)));
                placed = true;
            }
            attempts++;
        }
        if (!placed) {
            console.log(`Ei voitu sijoittaa monsteria ${i}`);
        }
    }
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

    // Piirrä yläpalkki
    ctx.drawImage(jewelBarImage, 0, 0);

    // Piirrä alapalkki
    ctx.drawImage(jewelBarImage, 0, canvas.height - JEWEL_BAR_HEIGHT);

    // Piirrä pelialue
    ctx.save();
    ctx.translate(0, JEWEL_BAR_HEIGHT);

    let viewportStartX = Math.floor(playerX / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);
    let viewportStartY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);

    for (let y = 0; y < VISIBLE_TILES; y++) {
        for (let x = 0; x < VISIBLE_TILES; x++) {
            let tileX = (viewportStartX + x + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);
            let tileY = (viewportStartY + y + GAME_SIZE / TILE_SIZE) % (GAME_SIZE / TILE_SIZE);

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

                // Piirrä jalokivet
                if (tileType === 0) {
                    let jewel = jewelPositions.find(j =>
                        j.block === blockIndex && j.x === tileX % 5 && j.y === tileY % 5
                    );
                    if (jewel && !collectedJewels[jewelPositions.indexOf(jewel)]) {
                        let jewelIndex = jewelPositions.indexOf(jewel);
                        ctx.drawImage(jewelImages[jewelIndex], x * TILE_SIZE, y * TILE_SIZE);
                    }
                }
            }
        }
    }

    // Piirrä monsterit
    ctx.save();
    ctx.rect(0, JEWEL_BAR_HEIGHT, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.clip();

    monsterPositions.forEach(monster => {
        let monsterGlobalX = (monster.block % 4) * 5 + monster.x;
        let monsterGlobalY = Math.floor(monster.block / 4) * 5 + monster.y;

        let monsterScreenX = (monsterGlobalX - viewportStartX) * TILE_SIZE;
        let monsterScreenY = (monsterGlobalY - viewportStartY) * TILE_SIZE;

        if (monsterScreenX >= -TILE_SIZE && monsterScreenX < VISIBLE_SIZE &&
            monsterScreenY >= -TILE_SIZE && monsterScreenY < VISIBLE_SIZE) {
            ctx.drawImage(
                monsterImages[monster.type],
                Math.round(monsterScreenX),
                Math.round(monsterScreenY)  // Poistettu JEWEL_BAR_HEIGHT
            );

            if (!monster.awake) {
                wakeUpMonster(monster);
            }
        }
    });

    ctx.restore();


    // Piirrä pelaaja keskelle ruutua
    ctx.drawImage(playerImage, Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2), Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));

    ctx.restore();

    // Piirrä kerätyt jalokivet alapalkkiin
    const jewelSize = TILE_SIZE / 2;
    const jewelMargin = 5;
    const jewelBarStartX = (canvas.width - (jewelPositions.length * (jewelSize + jewelMargin) - jewelMargin)) / 2;
    const jewelBarStartY = canvas.height - JEWEL_BAR_HEIGHT / 2 - jewelSize / 2;

    jewelPositions.forEach((jewel, index) => {
        if (collectedJewels[index]) {
            ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = 0.3;
        }
        ctx.drawImage(jewelImages[index], jewelBarStartX + index * (jewelSize + jewelMargin), jewelBarStartY, jewelSize, jewelSize);
    });
    ctx.globalAlpha = 1;
}

// Aloita peli
Promise.all([...Object.values(images), playerImage, ...jewelImages, ...monsterImages].map(img => new Promise(resolve => img.onload = resolve)))
    .then(() => {
        placeObjects();
        drawGame();
    });

function canMove(dx, dy) {
    let newX = playerX + dx * TILE_SIZE;
    let newY = playerY + dy * TILE_SIZE;

    // Varmistetaan, että uusi sijainti on pelialueen sisällä
    newX = (newX + GAME_SIZE) % GAME_SIZE;
    newY = (newY + GAME_SIZE) % GAME_SIZE;

    let blockX = Math.floor(newX / BLOCK_SIZE);
    let blockY = Math.floor(newY / BLOCK_SIZE);
    let tileX = Math.floor((newX % BLOCK_SIZE) / TILE_SIZE);
    let tileY = Math.floor((newY % BLOCK_SIZE) / TILE_SIZE);

    let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;
    let tileIndex = tileY * 5 + tileX;

    // Tarkistetaan, onko uusi sijainti tyhjä (arvo 0)
    return gameArea[blockIndex][tileIndex] === 0;
}

function movePlayer(dx, dy) {
    if (isMoving) return;

    if (canMove(dx, dy)) {
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

            checkJewelCollection();
            drawGame();

            if (--steps > 0) {
                requestAnimationFrame(animate);
            } else {
                isMoving = false;
            }
        }

        animate();
    }
}

function checkJewelCollection() {
    let blockX = Math.floor(playerX / BLOCK_SIZE);
    let blockY = Math.floor(playerY / BLOCK_SIZE);
    let tileX = Math.floor((playerX % BLOCK_SIZE) / TILE_SIZE);
    let tileY = Math.floor((playerY % BLOCK_SIZE) / TILE_SIZE);

    let blockIndex = blockY * (GAME_SIZE / BLOCK_SIZE) + blockX;

    let jewelIndex = jewelPositions.findIndex(j =>
        j.block === blockIndex && j.x === tileX && j.y === tileY
    );

    if (jewelIndex !== -1 && !collectedJewels[jewelIndex]) {
        collectedJewels[jewelIndex] = true;
        // Ei poisteta jalokiveä jewelPositions-taulukosta
    }
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
Promise.all([
    ...Object.values(images),
    playerImage,
    ...jewelImages,
    ...monsterImages
].map(img => new Promise(resolve => {
    if (img.complete) {
        resolve();
    } else {
        img.onload = resolve;
    }
})))
.then(() => {
    placeObjects();
    drawGame();
});