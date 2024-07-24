const jewelImages = [];
for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `images/jewel_${i.toString().padStart(2, '0')}.png`;
    jewelImages.push(img);
}

const pathTiles = [];
for (let i = 1; i <= 10; i++) {
    const img = new Image();
    img.src = `images/tile_${i.toString().padStart(3, '0')}.png`;
    img.onload = () => console.log(`Tile ${i} loaded`);
    img.onerror = () => console.error(`Failed to load tile ${i}`);
    pathTiles.push(img);
}

const flyingMonsterImage = new Image();
flyingMonsterImage.src = 'images/scarab_wing.png';
const safeRadius = 2; // Voit säätää tätä arvoa tarpeen mukaan
const GAME_SIZE = 2000;
const BLOCK_SIZE = 500;
const TILE_SIZE = 100;
const VISIBLE_TILES = 7;
const VISIBLE_SIZE = VISIBLE_TILES * TILE_SIZE;
const JEWEL_BAR_HEIGHT = 60;

const canvas = document.createElement('canvas');
canvas.height = VISIBLE_SIZE + 2 * JEWEL_BAR_HEIGHT;
canvas.width = VISIBLE_SIZE;

document.getElementById('gameArea').appendChild(canvas);
const ctx = canvas.getContext('2d');
let gameArea = [];
let gameOver = false;

let playerX = GAME_SIZE / 2 + TILE_SIZE * 2; // Keskimmäisen lohkon keskikohta
let playerY = GAME_SIZE / 2 + TILE_SIZE * 2;
let isMoving = false;
let collectedJewels = new Array(jewelImages.length).fill(false);
let statusText = '';

let playerSpeed = 0;
let speedBoostTimer = null;
let gameTime = 21; // 30 sekuntia alkuaikaa
let gameTimer = null;

const monsterAreas = [
    { x: 0, y: 0, width: 20, height: 10 },    // Yläosa
    { x: 0, y: 10, width: 20, height: 10 },   // Alaosa
    { x: 0, y: 0, width: 10, height: 20 },    // Vasen laita
    { x: 10, y: 0, width: 10, height: 20 },   // Oikea laita
    { x: 0, y: 5, width: 20, height: 10 },    // Keskiosa (vaaka)
    { x: 5, y: 0, width: 10, height: 20 }     // Keskiosa (pysty)
];

let flyingMonster = {
    x: 0,
    y: 0,
    size: 200,
    speed: 2
};

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

const deadMonsterImage = new Image();
deadMonsterImage.src = 'images/scarab_dead.png';

images['start'] = new Image();
images['start'].src = 'images/start_screen.png';

const playerSpeedImage = new Image();
playerSpeedImage.src = 'images/turtle_speed.png';
let isSpeedBoosted = false;

let playerHealth = 2; // 2 = täysin elossa, 1 = puolikuollut, 0 = kuollut
const playerImages = [
    new Image(), // turtle_03.png (kuollut)
    new Image(), // turtle_02.png (puolikuollut)
    new Image()  // turtle_01.png (täysin elossa)
];
playerImages[0].src = 'images/turtle_03.png';
playerImages[1].src = 'images/turtle_02.png';
playerImages[2].src = 'images/turtle_01.png';

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

function startGameTimer() {
    gameTimer = setInterval(() => {
        gameTime--;
        if (gameTime <= 0) {
            endGame("Time's up! GAME OVER!");
        }
    }, 1000);
}




function placeFlyingMonster() {
    const corners = [
        {x: 0, y: 0},
        {x: GAME_SIZE - flyingMonster.size, y: 0},
        {x: 0, y: GAME_SIZE - flyingMonster.size},
        {x: GAME_SIZE - flyingMonster.size, y: GAME_SIZE - flyingMonster.size}
    ];
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];
    flyingMonster.x = randomCorner.x;
    flyingMonster.y = randomCorner.y;
}

function moveFlyingMonster() {
    const dx = playerX - (flyingMonster.x + flyingMonster.size / 2);
    const dy = playerY - (flyingMonster.y + flyingMonster.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        flyingMonster.x += (dx / distance) * flyingMonster.speed;
        flyingMonster.y += (dy / distance) * flyingMonster.speed;
    }

    // Rajoita lentävä monsteri pelialueelle
    flyingMonster.x = Math.max(0, Math.min(GAME_SIZE - flyingMonster.size, flyingMonster.x));
    flyingMonster.y = Math.max(0, Math.min(GAME_SIZE - flyingMonster.size, flyingMonster.y));

    // Tarkista törmäys pelaajaan
    const monsterCenterX = flyingMonster.x + flyingMonster.size / 2;
    const monsterCenterY = flyingMonster.y + flyingMonster.size / 2;
    const playerCenterX = playerX + TILE_SIZE / 2;
    const playerCenterY = playerY + TILE_SIZE / 2;
    const collisionDistance = Math.sqrt(
        Math.pow(monsterCenterX - playerCenterX, 2) +
        Math.pow(monsterCenterY - playerCenterY, 2)
    );

    if (collisionDistance < 100) {
        playerHealth = 0;
        updateGameStatus();
    }
}

function randomPositionInArea(area) {
    let attempts = 0;
    const maxAttempts = 100;

    do {
        let x = area.x + Math.floor(Math.random() * area.width);
        let y = area.y + Math.floor(Math.random() * area.height);
        attempts++;

        // console.log(`Attempting to place monster at x=${x}, y=${y}`);
        let isValid = isValidMonsterPosition(x, y, safeRadius);
        // console.log(`Is position valid? ${isValid}`);
        if (isValid) {
            return { x, y };
        }
    } while (attempts < maxAttempts);

    // console.warn(`Failed to find valid position in area after ${maxAttempts} attempts:`, area);
    return null;
}

function createMonster(x, y, type) {
    return {
        x: x,
        y: y,
        type: type,
        area: monsterAreas[type],
        awake: false,
        moving: false,
        moveTimer: null,
        dead: false,
        canBeKilled: true,  // Ensimmäinen voidaan aina tappaa
        steps: 20
    };
}

function speedUpMonster(monster) {
    monster.steps = 10;
}

function createBlock() {
    let block = Array(25).fill(0);
    let piece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    let rotation = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotation; i++) {
        piece = rotatePiece(piece);
    }

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            let tileIndex = y * 5 + x;
            if (piece[y][x]) {
                block[tileIndex] = Math.floor(Math.random() * 17) + 1;
            } else {
                // Käytä negatiivista arvoa polkulaatoille
                block[tileIndex] = -Math.floor(Math.random() * pathTiles.length) - 1;
            }
        }
    }
    // console.log("Created block:", block);
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

function handleCollision(monster) {
    if (playerHealth > 0) {
        playerHealth--;
        monster.dead = true;
        updateGameStatus();
    }
}


function moveMonster(monster) {
    if (!monster.awake || monster.moving || monster.dead) {
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

    // Laske etäisyys pelaajaan
    let distanceToPlayer = calculateDistance(monster.x, monster.y, playerX / TILE_SIZE, playerY / TILE_SIZE);

    // Tarkista onko tämä lähin monsteri
    let isClosest = monsterPositions.every(otherMonster =>
        otherMonster === monster ||
        otherMonster.dead ||
        calculateDistance(otherMonster.x, otherMonster.y, playerX / TILE_SIZE, playerY / TILE_SIZE) > distanceToPlayer
    );

    // Säädä nopeutta sen mukaan, onko monsteri lähin
    monster.steps = isClosest ? 10 : 20;

    let chosenMove;
    if (isClosest) {
        // Jos tämä on lähin monsteri, valitse liike joka vie lähemmäs pelaajaa
        chosenMove = possibleMoves.reduce((best, move) => {
            let newDistance = calculateDistance(monster.x + move.x, monster.y + move.y, playerX / TILE_SIZE, playerY / TILE_SIZE);
            return newDistance < best.distance ? {move, distance: newDistance} : best;
        }, {move: possibleMoves[0], distance: Infinity}).move;
    } else {
        // Muuten valitse satunnainen liike
        chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }


    let newX = monster.x + chosenMove.x;
    let newY = monster.y + chosenMove.y;

    // Tarkista törmäys pelaajaan ennen liikkumista
    if (Math.floor(newX) === Math.floor(playerX / TILE_SIZE) &&
        Math.floor(newY) === Math.floor(playerY / TILE_SIZE)) {
        handleCollision(monster);
        monster.moving = false;
        scheduleMonsterMove(monster);
        return;
    }

    // Varmista, että uusi sijainti on monsterin omalla alueella
    newX = Math.max(monster.area.x, Math.min(monster.area.x + monster.area.width - 1, newX));
    newY = Math.max(monster.area.y, Math.min(monster.area.y + monster.area.height - 1, newY));

    // console.log(`Monster ${monster.type} at (${monster.x}, ${monster.y}) chose to move to (${newX}, ${newY})`);


    animateMonsterMove(monster, {x: newX, y: newY}, 20);
}

function checkCollision() {
    let playerTileX = Math.floor(playerX / TILE_SIZE);
    let playerTileY = Math.floor(playerY / TILE_SIZE);

    monsterPositions.forEach(monster => {
        if (!monster.dead) {
            let monsterTileX = Math.floor(monster.x);
            let monsterTileY = Math.floor(monster.y);

            if (playerTileX === monsterTileX && playerTileY === monsterTileY) {
                if (monster.canBeKilled) {
                    monster.dead = true;
                    // Etsi toinen samanvärinen monsteri ja nopeuta sitä
                    let sameTypeMonster = monsterPositions.find(m => m.type === monster.type && !m.dead);
                    if (sameTypeMonster) {
                        speedUpMonster(sameTypeMonster);
                        sameTypeMonster.canBeKilled = true;  // Toinen monsteri voidaan nyt tappaa
                    }
                } else {
                    playerHealth--;
                    updateGameStatus();
                }
            }
        }
    });
}

function updateGameStatus() {
    if (playerHealth === 1) {
        statusText = 'Turtle is half dead. Next hit will be fatal!';
    } else if (playerHealth === 0) {
        statusText = 'Turtle is dead. GAME OVER!';
    } else if (collectedJewels.filter(Boolean).length === 12) {
        statusText = 'You WON! You collected all 12 jewels!';
    } else {
        statusText = ''; // Tyhjennä teksti, jos mikään erityistilanne ei ole päällä
    }
}

function isValidMonsterPosition(x, y, safeRadius) {
    // console.log(`Checking monster position: x=${x}, y=${y}`);

    // Laske lohkon indeksi ja lohkon sisäinen sijainti
    let blockX = Math.floor(x / 5);
    let blockY = Math.floor(y / 5);
    let tileX = x % 5;
    let tileY = y % 5;

    let blockIndex = blockY * 4 + blockX;  // 4 lohkoa per rivi
    let tileIndex = tileY * 5 + tileX;

    // console.log(`Block: ${blockIndex}, Tile: ${tileIndex}`);

    if (blockIndex < 0 || blockIndex >= gameArea.length || !gameArea[blockIndex]) {
        // console.log("Invalid block index");
        return false;
    }

    if (gameArea[blockIndex][tileIndex] > 0) {
        // console.log("Tile is not empty");
        return false;
    }

    // Tarkista, ettei paikassa ole jo jalokiveä tai monsteria
    if (jewelPositions.some(jewel => jewel.block === blockIndex && jewel.x === tileX && jewel.y === tileY)) {
        console.log("Position contains a jewel");
        return false;
    }

    if (monsterPositions.some(monster => monster.x === x && monster.y === y)) {
        console.log("Position contains another monster");
        return false;
    }

    // Tarkista, ettei monsteri ole pelaajan vieressä tai samassa ruudussa
    const playerTileX = Math.floor(playerX / TILE_SIZE);
    const playerTileY = Math.floor(playerY / TILE_SIZE);

    // console.log(`Player position: playerTileX=${playerTileX}, playerTileY=${playerTileY}`);
    // console.log(`Safe radius: ${safeRadius}`);

    const dx = Math.abs(x - playerTileX);
    const dy = Math.abs(y - playerTileY);

    // console.log(`Distance: dx=${dx}, dy=${dy}`);

    if (dx < safeRadius && dy < safeRadius) {
        // console.log("Position is too close to player!");
        return false;
    }

    // console.log("Position is valid");
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
        let newX = monster.x + move.x;
        let newY = monster.y + move.y;

        // Tarkista, onko uusi sijainti monsterin omalla alueella
        if (newX < monster.area.x || newX >= monster.area.x + monster.area.width ||
            newY < monster.area.y || newY >= monster.area.y + monster.area.height) {
            return false;
        }

        // Tarkista, onko uusi sijainti vapaa
        return isValidMonsterPosition(newX, newY);
    });
}

function animateMonsterMove(monster, newPos, steps) {
    const startX = monster.x;
    const startY = monster.y;
    let currentStep = 0;

    function animate() {
        currentStep++;
        const progress = currentStep / steps;

        monster.x = startX + (newPos.x - startX) * progress;
        monster.y = startY + (newPos.y - startY) * progress;

        if (currentStep < steps) {
            requestAnimationFrame(animate);
        } else {
            monster.x = newPos.x;
            monster.y = newPos.y;
            monster.moving = false;
            scheduleMonsterMove(monster);
        }
    }
    animate();
}

function placeObjects() {
    console.log(`Player initial position: playerX=${playerX}, playerY=${playerY}`);
    // console.log("gameArea contents:");
    for (let y = 0; y < GAME_SIZE; y++) {
        let row = "";
        for (let x = 0; x < GAME_SIZE; x++) {
            row += gameArea[y * GAME_SIZE + x] === 0 ? "." : "#";
        }
        // console.log(row);
    }

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

    // Monsterien sijoitus
    for (let i = 0; i < monsterAreas.length; i++) {
        let area = monsterAreas[i];
        let position = randomPositionInArea(area);
        if (position && isValidMonsterPosition(position.x, position.y, safeRadius)) {
            let monster = createMonster(position.x, position.y, i);
            monsterPositions.push(monster);
        }
    }
}

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

    // console.log(`Tarkistetaan positio: blockX ${blockX}, blockY ${blockY}, tileX ${tileX}, tileY ${tileY}, blockIndex ${blockIndex}, tileIndex ${tileIndex}`);

    // Tarkista, onko positio keskuslohkossa
    if (blockX === 2 && blockY === 2) {
        return false; // Ei sallita objekteja keskuslohkoon
    }

    // Tarkista, onko blockIndex validi
    if (blockIndex < 0 || blockIndex >= gameArea.length) {
        // console.log("Positio hylätty: invalid blockIndex");
        return false;
    }

    // Tarkista, onko ruudussa muuri tai polku
    if (!gameArea[blockIndex] || gameArea[blockIndex][tileIndex] > 0) {
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
        // console.log("Positio hylätty: liian lähellä pelaajaa");
        return false;
    }

    // Tarkista, onko ruudussa jo jalokivi tai monsteri
    for (let jewel of jewelPositions) {
        if (jewel.block === blockIndex && jewel.x === tileX && jewel.y === tileY) {
            // console.log("Positio hylätty: jo jalokivi");
            return false;
        }
    }
    for (let monster of monsterPositions) {
        if (monster.block === blockIndex && monster.x === tileX && monster.y === tileY) {
            // console.log("Positio hylätty: jo monsteri");
            return false;
        }
    }

    // console.log("Positio hyväksytty");
    return true;
}

function drawGame() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);



    // Piirrä yläpalkki
    ctx.drawImage(jewelBarImage, 0, 0);

    // Piirrä alapalkki
    ctx.drawImage(jewelBarImage, 0, canvas.height - JEWEL_BAR_HEIGHT);

    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${Math.max(0, Math.floor(gameTime))}s`, canvas.width - 10, JEWEL_BAR_HEIGHT / 2 + 8);

    // Piirrä statustext yläpalkkiin
    if (statusText) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(statusText, canvas.width / 2, JEWEL_BAR_HEIGHT / 2 + 8);
    }


    // Piirrä pelialue
    ctx.save();
    ctx.translate(0, JEWEL_BAR_HEIGHT);
    ctx.rect(0, 0, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.clip();


    let viewportStartX = Math.floor(playerX / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);
    let viewportStartY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);
    // let viewportStartY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2) - Math.floor(JEWEL_BAR_HEIGHT / TILE_SIZE);

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

                // Piirrä vain näkyvä osa aloituskuvasta
                ctx.drawImage(
                    images['start'],
                    Math.max(0, -startScreenX),
                    Math.max(0, -startScreenY),
                    Math.min(VISIBLE_SIZE - startScreenX, VISIBLE_SIZE),
                    Math.min(VISIBLE_SIZE - startScreenY, VISIBLE_SIZE),
                    Math.max(0, startScreenX),
                    Math.max(0, startScreenY),
                    Math.min(VISIBLE_SIZE - startScreenX, VISIBLE_SIZE),
                    Math.min(VISIBLE_SIZE - startScreenY, VISIBLE_SIZE)
                );

                // ctx.drawImage(images['start'], startScreenX, startScreenY);
            } else {
                let tileType = gameArea[blockIndex][tileIndex];
                // console.log(`Drawing tile at (${x},${y}): type ${tileType}`);
                if (tileType > 0) {
                    ctx.drawImage(images[tileType], x * TILE_SIZE, y * TILE_SIZE);
                } else if (tileType < 0) {
                    // Piirrä satunnainen polkulaatta
                    ctx.drawImage(pathTiles[-tileType - 1], x * TILE_SIZE, y * TILE_SIZE);
                }


                // Piirrä jalokivet
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

    // Piirrä monsterit
    ctx.save();
    // ctx.rect(0, JEWEL_BAR_HEIGHT, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.rect(0, 0, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.clip();

    monsterPositions.forEach(monster => {
        // Laske monsterin sijainti suhteessa näkyvään alueeseen
        let monsterScreenX = (monster.x - viewportStartX) * TILE_SIZE;
        let monsterScreenY = (monster.y - viewportStartY) * TILE_SIZE;

        if (monsterScreenX >= -TILE_SIZE && monsterScreenX < VISIBLE_SIZE + TILE_SIZE &&
            monsterScreenY >= -TILE_SIZE && monsterScreenY < VISIBLE_SIZE + TILE_SIZE) {
            if (monster.dead) {
                ctx.drawImage(deadMonsterImage, Math.round(monsterScreenX), Math.round(monsterScreenY));
            } else {
                ctx.drawImage(monsterImages[monster.type], Math.round(monsterScreenX), Math.round(monsterScreenY));
            }

            if (!monster.awake) {
                wakeUpMonster(monster);
            }
        }
    });
    ctx.restore();

    // Piirrä lentävä monsteri
    const monsterScreenX = flyingMonster.x - viewportStartX * TILE_SIZE;
    const monsterScreenY = flyingMonster.y - viewportStartY * TILE_SIZE;
    ctx.drawImage(flyingMonsterImage, monsterScreenX, monsterScreenY, flyingMonster.size, flyingMonster.size);

    // Piirrä pelaaja keskelle ruutua
    // ctx.drawImage(playerImage, Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2), Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));
    // Piirrä pelaaja
    const playerImageToDraw = isSpeedBoosted ? playerSpeedImage : playerImages[playerHealth];
    ctx.drawImage(playerImageToDraw,
        Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2),
        Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));
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

    // Tarkistetaan, onko uusi sijainti käveltävä (arvo 0 tai negatiivinen) tai kuollut monsteri
    return gameArea[blockIndex][tileIndex] <= 0 ||
           monsterPositions.some(m => m.dead && m.x === tileX && m.y === tileY);
}

function movePlayer(dx, dy) {
    if (isMoving || playerHealth === 0) return;

    if (canMove(dx, dy)) {
        isMoving = true;

        let targetX = playerX + dx * TILE_SIZE;
        let targetY = playerY + dy * TILE_SIZE;
        let steps = 5 - playerSpeed;
        let stepX = dx * TILE_SIZE / steps
        let stepY = dy * TILE_SIZE / steps

        function animate() {
            playerX += stepX;
            playerY += stepY;

            playerX = (playerX + GAME_SIZE) % GAME_SIZE;
            playerY = (playerY + GAME_SIZE) % GAME_SIZE;

            checkJewelCollection();
            checkCollision();  // Lisää tämä rivi
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

function activateSpeedBoost() {
    playerSpeed = 1; // 25% nopeampi
    isSpeedBoosted = true;
    if (speedBoostTimer) clearTimeout(speedBoostTimer);
    speedBoostTimer = setTimeout(() => {
        playerSpeed = 0;
        isSpeedBoosted = false;
        speedBoostTimer = null;
    }, 5000); // 5 sekuntia
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
        gameTime += 7; // Lisää 10 sekuntia aikaa
        activateSpeedBoost();
        if (collectedJewels.filter(Boolean).length === 12) {
            updateGameStatus(); // Tarkista voitto
            endGame("You WON! You collected all 12 jewels!");
        }
    }
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


function endGame(message) {
    statusText = message;
    // Pysäytä peli tässä, esim. asettamalla gameOver-lippu
    gameOver = true;
    clearInterval(gameTimer);
}

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});

function gameLoop() {
    if (!gameOver) {
        moveFlyingMonster();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

function initGame() {
    placeFlyingMonster();
    placeObjects();
    startGameTimer();
    gameLoop();
}

Promise.all([
    ...Object.values(images),
    ...playerImages,
    ...jewelImages,
    ...monsterImages,
    deadMonsterImage,
    ...pathTiles,
    playerSpeedImage
].map(img => new Promise(resolve => {
    if (img.complete) {
        resolve();
    } else {
        img.onload = resolve;
    }
})))
.then(() => {
    console.log("All images loaded");
    initGame();
})
.catch(error => {
    console.error("Error loading images:", error);
});
