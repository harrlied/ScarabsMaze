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

const JEWEL_BAR_HEIGHT = 60;
const canvas = document.createElement('canvas');
canvas.height = VISIBLE_SIZE + 2 * JEWEL_BAR_HEIGHT;
canvas.width = VISIBLE_SIZE;


document.getElementById('gameArea').appendChild(canvas);
const ctx = canvas.getContext('2d');


let gameArea = [];

let playerX = GAME_SIZE / 2 + TILE_SIZE * 2; // Keskimmäisen lohkon keskikohta
let playerY = GAME_SIZE / 2 + TILE_SIZE * 2;
let isMoving = false;

let collectedJewels = new Array(jewelImages.length).fill(false);

let statusText = '';

const monsterAreas = [
    { x: 0, y: 0, width: 20, height: 10 },    // Yläosa
    { x: 0, y: 10, width: 20, height: 10 },   // Alaosa
    { x: 0, y: 0, width: 10, height: 20 },    // Vasen laita
    { x: 10, y: 0, width: 10, height: 20 },   // Oikea laita
    { x: 0, y: 5, width: 20, height: 10 },    // Keskiosa (vaaka)
    { x: 5, y: 0, width: 10, height: 20 }     // Keskiosa (pysty)
];

console.log("Monster areas:", monsterAreas);
console.log("GAME_SIZE:", GAME_SIZE);
console.log("gameArea length:", gameArea.length);


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



let playerHealth = 2; // 2 = täysin elossa, 1 = puolikuollut, 0 = kuollut
const playerImages = [
    new Image(), // turtle_03.png (kuollut)
    new Image(), // turtle_02.png (puolikuollut)
    new Image()  // turtle_01.png (täysin elossa)
];
playerImages[0].src = 'images/turtle_03.png';
playerImages[1].src = 'images/turtle_02.png';
playerImages[2].src = 'images/turtle_01.png';


// const playerImage = new Image();
// playerImage.src = 'images/turtle_01.png';

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

function randomPositionInArea(area) {
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;

    // console.log(`Trying to place monster in area:`, area);

    do {
        x = area.x + Math.floor(Math.random() * area.width);
        y = area.y + Math.floor(Math.random() * area.height);
        attempts++;
        // console.log(`Attempt ${attempts}: Trying position (${x}, ${y})`);
    } while (!isValidMonsterPosition(x, y) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
        console.error(`Failed to find valid position in area after ${maxAttempts} attempts:`, area);
        return null;
    }

    // console.log(`Found valid position (${x}, ${y}) after ${attempts} attempts`);
    return { x, y };
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
        dead: false
    };
}

function createBlock() {
    let block = Array(25).fill(0);
    let piece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    let rotation = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotation; i++) {
        piece = rotatePiece(piece);
    }

    // console.log("Creating block with piece:", piece);

    // Aloituskohta on aina (0,0)
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (piece[y][x]) {
                let index = y * 5 + x;
                block[index] = Math.floor(Math.random() * 17) + 1;
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

    let chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
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

    animateMonsterMove(monster, {x: newX, y: newY});
}

function checkCollision() {
    let playerTileX = Math.floor(playerX / TILE_SIZE);
    let playerTileY = Math.floor(playerY / TILE_SIZE);

    monsterPositions.forEach(monster => {
        if (!monster.dead) {
            let monsterTileX = Math.floor(monster.x);
            let monsterTileY = Math.floor(monster.y);

            if (playerTileX === monsterTileX && playerTileY === monsterTileY) {
                console.log("Pelaaja törmäsi monsteriin!");
                monster.dead = true;
                // Tässä vaiheessa emme vielä lopeta peliä
            }
        }
    });
}

function handleCollision(monster) {
    if (playerHealth > 0) {
        playerHealth--;
        monster.dead = true;
        updateGameStatus();
    }
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

function animateMonsterMove(monster, newPos) {
    const steps = 10;
    const startX = monster.x;
    const startY = monster.y;
    const startBlock = monster.block;
    const endX = newPos.x;
    const endY = newPos.y;
    const endBlock = newPos.block;
    let currentStep = 0;

    function animate() {
        currentStep++;
        const progress = currentStep / steps;

        let newX, newY, currentBlock;

        if (startBlock !== endBlock) {
            // Lohkon vaihto
            let dx = (endX - startX + 5) % 5;
            let dy = (endY - startY + 5) % 5;

            // Jos dx tai dy on suurempi kuin 2.5, liikutaan vastakkaiseen suuntaan
            if (dx > 2.5) dx -= 5;
            if (dy > 2.5) dy -= 5;

            newX = startX + dx * progress;
            newY = startY + dy * progress;

            // Varmista, että koordinaatit pysyvät välillä [0, 5)
            newX = (newX + 5) % 5;
            newY = (newY + 5) % 5;

            // Määritä nykyinen lohko liikkeen puolivälissä
            if (progress < 0.5) {
                currentBlock = startBlock;
            } else {
                currentBlock = endBlock;
            }
        } else {
            // Sama lohko
            newX = startX + (endX - startX) * progress;
            newY = startY + (endY - startY) * progress;
            currentBlock = startBlock;
        }

        monster.x = newX;
        monster.y = newY;
        monster.block = currentBlock;

        drawGame();

        if (currentStep < steps) {
            requestAnimationFrame(animate);
        } else {
            monster.x = endX;
            monster.y = endY;
            monster.block = endBlock;
            monster.moving = false;
            scheduleMonsterMove(monster);
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

    // console.log(`After update: block ${monster.block}, x: ${monster.x}, y: ${monster.y}`);
}

function placeObjects() {
    // console.log("gameArea contents:");
    // for (let y = 0; y < GAME_SIZE; y++) {
    //     let row = "";
    //     for (let x = 0; x < GAME_SIZE; x++) {
    //         row += gameArea[y * GAME_SIZE + x] === 0 ? "." : "#";
    //     }
    //     console.log(row);
    // }

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

    /// Sijoita monsterit
    for (let i = 0; i < 6; i++) {
        let monstersPlaced = 0;
        let attempts = 0;
        while (monstersPlaced < 2 && attempts < 1000) {
            let area = monsterAreas[i];
            let position = randomPositionInArea(area);
            if (position) {
                let monster = createMonster(position.x, position.y, i);
                monsterPositions.push(monster);
                // console.log(`Placed monster of type ${i} at (${position.x}, ${position.y})`);
                monstersPlaced++;
            }
            attempts++;
        }
        if (monstersPlaced < 2) {
            console.error(`Failed to place all monsters of type ${i}. Placed ${monstersPlaced}`);
        }
    }
   monsterPositions.forEach(monster => wakeUpMonster(monster));
}


function isValidMonsterPosition(x, y) {
    // console.log(`Checking position (${x}, ${y})`);

    // Laske lohkon indeksi ja lohkon sisäinen sijainti
    let blockX = Math.floor(x / 5);
    let blockY = Math.floor(y / 5);
    let tileX = x % 5;
    let tileY = y % 5;

    let blockIndex = blockY * 4 + blockX;  // 4 lohkoa per rivi
    let tileIndex = tileY * 5 + tileX;

    if (blockIndex < 0 || blockIndex >= gameArea.length || !gameArea[blockIndex]) {
        // console.log(`Invalid block index: ${blockIndex}`);
        return false;
    }

    if (gameArea[blockIndex][tileIndex] !== 0) {
        // console.log(`Position (${x}, ${y}) is not empty in gameArea`);
        return false;
    }

    // Tarkista, ettei paikassa ole jo jalokiveä tai monsteria
    if (jewelPositions.some(jewel => jewel.block === blockIndex && jewel.x === tileX && jewel.y === tileY)) {
        // console.log(`Position (${x}, ${y}) contains a jewel`);
        return false;
    }

    if (monsterPositions.some(monster => monster.block === blockIndex && monster.x === tileX && monster.y === tileY)) {
        // console.log(`Position (${x}, ${y}) contains another monster`);
        return false;
    }

    // console.log(`Position (${x}, ${y}) is valid`);
    return true;
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

    // Tarkista, onko ruudussa muuri
    if (!gameArea[blockIndex] || gameArea[blockIndex][tileIndex] !== 0) {
        // console.log("Positio hylätty: muuri tai invalid tileIndex");
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
    // let viewportStartY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2);
    let viewportStartY = Math.floor(playerY / TILE_SIZE) - Math.floor(VISIBLE_TILES / 2) - Math.floor(JEWEL_BAR_HEIGHT / TILE_SIZE);

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
    // ctx.rect(0, JEWEL_BAR_HEIGHT, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.rect(0, 0, VISIBLE_SIZE, VISIBLE_SIZE);
    ctx.clip();

    monsterPositions.forEach(monster => {
        // Laske monsterin sijainti suhteessa näkyvään alueeseen
        let monsterScreenX = (monster.x - viewportStartX) * TILE_SIZE;
        let monsterScreenY = (monster.y - viewportStartY) * TILE_SIZE;

        if (monsterScreenX >= -TILE_SIZE && monsterScreenX < VISIBLE_SIZE &&
            monsterScreenY >= -TILE_SIZE && monsterScreenY < VISIBLE_SIZE) {
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


    // Piirrä pelaaja keskelle ruutua
    // ctx.drawImage(playerImage, Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2), Math.floor(VISIBLE_SIZE / 2 - TILE_SIZE / 2));
    // Piirrä pelaaja
    ctx.drawImage(playerImages[playerHealth],
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

    // Piirrä statustext yläpalkkiin
    if (statusText) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(statusText, canvas.width / 2, JEWEL_BAR_HEIGHT / 2 + 8);
    }

    ctx.globalAlpha = 1;
}

/// Aloita peli
// Promise.all([
//     ...Object.values(images),
//     playerImage,
//     ...jewelImages,
//     ...monsterImages
// ].map(img => new Promise(resolve => {
//     if (img.complete) {
//         resolve();
//     } else {
//         img.onload = resolve;
//     }
// })))
// .then(() => {
//     placeObjects();  // Varmista, että tämä kutsu on täällä
//     drawGame();
// });


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

    // Tarkistetaan, onko uusi sijainti tyhjä (arvo 0) tai kuollut monsteri
    return gameArea[blockIndex][tileIndex] === 0 ||
           monsterPositions.some(m => m.dead && m.x === tileX && m.y === tileY);
}

function movePlayer(dx, dy) {
    if (isMoving || playerHealth === 0) return;

    if (canMove(dx, dy)) {
        isMoving = true;

        let targetX = playerX + dx * TILE_SIZE;
        let targetY = playerY + dy * TILE_SIZE;
        let steps = 5;
        let stepX = dx * TILE_SIZE / steps;
        let stepY = dy * TILE_SIZE / steps;

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
        if (collectedJewels.filter(Boolean).length === 12) {
            updateGameStatus(); // Tarkista voitto
        }
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

Promise.all([
    ...Object.values(images),
    ...playerImages,  // Muutettu playerImage -> playerImages
    ...jewelImages,
    ...monsterImages,
    deadMonsterImage  // Lisätään myös kuolleen monsterin kuva
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
