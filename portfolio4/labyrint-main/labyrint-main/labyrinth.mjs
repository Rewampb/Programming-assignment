import ANSI from "./utils/ANSI.mjs";
import KeyBoardManager from "./utils/KeyBoardManager.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import * as CONST from "./constants.mjs";

const startingLevel = CONST.START_LEVEL_ID;
const levels = loadLevelListings();

function loadLevelListings(source = CONST.LEVEL_LISTING_FILE) {
    let data = readRecordFile(source);
    let levels = {};
    for (const item of data) {
        let keyValue = item.split(":");
        if (keyValue.length >= 2) {
            let key = keyValue[0];
            let value = keyValue[1];
            levels[key] = value;
        }
    }
    return levels;
}

let levelData = readMapFile(levels[startingLevel]);
let level = levelData;

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.RED,
    "$": ANSI.COLOR.YELLOW,
    "B": ANSI.COLOR.GREEN,
    "X": ANSI.COLOR.CYAN,
    "♨︎": ANSI.COLOR.MAGENTA,
    "D": ANSI.COLOR.BLUE,
};

let isDirty = true;

let playerPos = {
    row: null,
    col: null,
};

const EMPTY = " ";
const HERO = "H";
const LOOT = "$";
const ARCHER = "B";
const GUARD = "X";
const TELEPORTER = "♨︎";
const DOOR = "D"

let direction = -1;

let items = [];

const THINGS = [LOOT, EMPTY, ARCHER, GUARD, TELEPORTER];

let eventText = "";

const HP_MAX = 10;

const playerStats = {
    hp: 8,
    chash: 0,
};

class Labyrinth {
    constructor() {
        this.archerNpcTimers = {};
        this.guardNpcTimers = {};
        this.projectiles = [];
        this.level = loadLevelListings();
        this.currentLevel = "start";
        this.previousLevel = null;
        this.loadLevel(this.currentLevel);
        this.initializeNPCs();
        this.teleporters = this.findTeleporters();
        this.currentTeleporterIndex = -1;
    }

    loadLevel(levelName) {
        let levelFileName = this.level[levelName];
        if (!levelFileName) {
            console.error(`Level "${levelName}" not found.`);
            return;
        }
        let levelData = readMapFile(levelFileName);
        level = levelData;
        this.previousLevel = this.currentLevel;
        this.currentLevel = levelName;
        this.initializePlayerPosition();
        this.teleporters = this.findTeleporters();
        this.currentTeleporterIndex = -1;
    }

    initializePlayerPosition() {
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === HERO) {
                    playerPos.row = row;
                    playerPos.col = col;
                    break;
                }
            }
            if (playerPos.row != null) break;
        }
    }

    findTeleporters() {
        let teleporters = [];
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === TELEPORTER) {
                    teleporters.push({ row, col });
                }
            }
        }
        return teleporters;
    }

    handleTeleportation() {
        for (let i = 0; i < this.teleporters.length; i++) {
            const teleporter = this.teleporters[i];
            if (playerPos.row === teleporter.row && playerPos.col === teleporter.col) {
                this.currentTeleporterIndex = (this.currentTeleporterIndex + 1) % this.teleporters.length;
                let nextTeleporter = this.teleporters[this.currentTeleporterIndex];
                playerPos.row = nextTeleporter.row;
                playerPos.col = nextTeleporter.col;
                eventText = "Player teleported!";
                break;
            }
        }
    }

    update() {
        if (playerPos.row == null) {
            this.initializePlayerPosition();
        }
        this.handlePlayerMovement();
        this.updateArcherNPCs();
        this.updateGuardNPCs();
        this.checkCollisions();
        this.checkDoor();
        this.handleTeleportation();
    }

    initializePlayerPosition() {
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === HERO) {
                    playerPos.row = row;
                    playerPos.col = col;
                    break;
                }
            }
            if (playerPos.row != null) break;
        }
    }

    handlePlayerMovement() {
        let drow = 0;
        let dcol = 0;

        if (KeyBoardManager.isUpPressed()) {
            drow = -1;
        } else if (KeyBoardManager.isDownPressed()) {
            drow = 1;
        }

        if (KeyBoardManager.isLeftPressed()) {
            dcol = -1;
        } else if (KeyBoardManager.isRightPressed()) {
            dcol = 1;
        }

        let tRow = playerPos.row + drow;
        let tcol = playerPos.col + dcol;

        if (THINGS.includes(level[tRow][tcol])) {
            let currentItem = level[tRow][tcol];
            if (currentItem == LOOT) {
                let loot = Math.round(Math.random() * 7) + 3;
                playerStats.chash += loot;
                eventText = `Player gained ${loot}$`;
            }

            level[playerPos.row][playerPos.col] = EMPTY;
            level[tRow][tcol] = HERO;

            playerPos.row = tRow;
            playerPos.col = tcol;

            isDirty = true;
        } else {
            direction *= -1;
        }
    }

    initializeNPCs() {
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === B) {
                    this.archerNpcTimers[`${row},${col}`] = 0;
                }
            }
        }

        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === X) {
                    this.guardNpcTimers[`${row},${col}`] = { movingRight: true, timer: 0 };
                }
            }
        }
    }

    updateArcherNPCs() {
        const currentTime = Date.now();
        for (let key in this.archerNpcTimers) {
            const [row, col] = key.split(",").map(Number);
            let timer = this.archerNpcTimers[key];

            if (currentTime - timer >= 3000) {
                this.archerNpcTimers[key] = currentTime;
                this.shootProjectile(row, col);
            }
        }
    }

    shootProjectile(row, col) {
        let direction = null;
        for (let drow = -1; drow <= 1; drow++) {
            for (let dcol = -1; dcol <= 1; dcol++) {
                if ((drow === 0 || dcol === 0) && !(drow === 0 && dcol === 0)) {
                    direction = { row: drow, col: dcol };
                    this.projectilePath(row, col, direction);
                }
            }
        }
    }

    projectilePath(row, col, direction) {
        let tRow = row;
        let tCol = col;
        while (this.isValidPosition(tRow + direction.row, tCol + direction.col)) {
            tRow += direction.row;
            tCol += direction.col;

            if (tRow === playerPos.row && tCol === playerPos.col) {
                playerStats.hp -= 1; 
                eventText = "Player hit by Archer NPC's projectile!";
                break;
            }
            if (level[tRow][tCol] !== EMPTY) {
                break;
            }
        }
    }

    updateGuardNPCs() {
        const currentTime = Date.now();
        for (let key in this.guardNpcTimers) {
            const [row, col] = key.split(",").map(Number);
            let npc = this.guardNpcTimers[key];

            npc.timer += 100;

            if (npc.timer >= 1000) {
                npc.timer = 0;
                this.patrolGuard(row, col, npc);
            }
        }
    }

    patrolGuard(row, col, npc) {
        let startPos = { row: row, col: col };
        let endPos = { row: row, col: col + 2 };

        if (npc.movingRight) {
            if (col < endPos.col) {
                level[row][col] = EMPTY;
                col++;
                level[row][col] = X;
            } else {
                npc.movingRight = false;
            }
        } else {
            if (col > startPos.col) {
                level[row][col] = EMPTY;
                col--;
                level[row][col] = X;
            } else {
                npc.movingRight = true;
            }
        }
    }

    isValidPosition(row, col) {
        return row >= 0 && row < level.length && col >= 0 && col < level[row].length && level[row][col] !== "█";
    }

    checkCollisions() {
        this.projectiles.forEach((proj, index) => {
            let { row, col, direction } = proj;
    
            if (row === playerPos.row && col === playerPos.col) {
                playerStats.hp -= 1;
                eventText = "Player hit by projectile!";
                this.projectiles.splice(index, 1);
            } else {
                row += direction.row;
                col += direction.col;
    
                if (!this.isValidPosition(row, col) || level[row][col] === "█") {
                    this.projectiles.splice(index, 1);
                } else {
                    proj.row = row;
                    proj.col = col;
                }
            }
        });
    }

    checkDoor() {
        if (level[playerPos.row][playerPos.col] === "D") {
            let nextLevel;
            if (this.currentLevel === "start") {
                nextLevel = "aSharpPlace";
            } else if (this.currentLevel === "aSharpPlace") {
                nextLevel = "anotherMaze";
            } else if (this.currentLevel === "anotherMaze") {
                nextLevel = "aSharpPlace";
            }
    
            if (nextLevel) {
                this.loadLevel(nextLevel);
                this.initializePlayerPosition();
                eventText = `Player moved through the door to ${nextLevel}!`;
            }
        }
    }

    draw() {
        if (isDirty == false) {
            return;
        }
        isDirty = false;

        console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

        let rendering = "";
        rendering += renderHud();

        for (let row = 0; row < level.length; row++) {
            let rowRendering = "";
            for (let col = 0; col < level[row].length; col++) {
                let symbol = level[row][col];
                if (pallet[symbol] != undefined) {
                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                } else {
                    rowRendering += symbol;
                }
            }
            rowRendering += "\n";
            rendering += rowRendering;
        }

        console.log(rendering);
        if (eventText !== "") {
            console.log(eventText);
            eventText = "";
        }
    }
}

function renderHud() {
    let hpBar = `Life:[${ANSI.COLOR.RED + pad(playerStats.hp, "♥︎") + ANSI.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + pad(HP_MAX - playerStats.hp, "♥︎") + ANSI.COLOR_RESET}]`;
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash}\n`;
}

function pad(len, text) {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += text;
    }
    return output;
}

export default Labyrinth;