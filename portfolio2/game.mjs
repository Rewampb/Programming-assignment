import { print, askQuestion } from "./io.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const EMPTY_CELL = 0;
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const MARKER_EMPTY = '_ ';
const WINNING_SUM = 3; 
const OUTCOME_DRAW = 'draw';
const OUTCOME_CONTINUE = 0;
const PLAYER_INPUT_OFFSET = 1;

const MENU_PLAY_GAME = "1";
const MENU_PVP = "2"; 
const MENU_PVC = "3"; 
const MENU_SHOW_SETTINGS = "4";
const MENU_EXIT_GAME = "5";

let language = DICTIONARY.en;

let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(startGame, 2500); 

async function startGame() {
    while (true) {
        const chosenAction = await showMenu();
        
        switch (chosenAction) {
            case MENU_PLAY_GAME:
                await selectGameMode();
                break;
            case MENU_SHOW_SETTINGS:
                await showSettings();
                break;
            case MENU_EXIT_GAME:
                clearScreen();
                process.exit();
        }
    }
}

async function showMenu() {
    let choice;
    do {
        clearScreen();
        print(ANSI.COLOR.YELLOW + "MENU" + ANSI.RESET);
        print(`${MENU_PLAY_GAME}. Play Game`);
        print(`${MENU_SHOW_SETTINGS}. ${language.SETTINGS}`);
        print(`${MENU_EXIT_GAME}. Exit Game`);

        choice = await askQuestion("");
    } while (!Object.values(MENU_CHOICES).includes(choice));

    return choice;
}

async function selectGameMode() {
    clearScreen();
    print(language.GAME_MODE); 
    print(`${MENU_PVP}. Player vs Player (PvP)`);
    print(`${MENU_PVC}. Player vs Computer (PvC)`);
    
    let choice;
    do {
        choice = await askQuestion("Choose your game mode: ");
    } while (![MENU_PVP, MENU_PVC].includes(choice));

    await runGame(choice);
}

async function runGame(gameMode) {
    let isPlaying = true;
    while (isPlaying) {
        initializeGame();
        isPlaying = await playGame(gameMode); 
    }
}

async function playGame(gameMode) {
    let outcome;
    do {
        clearScreen();
        displayGameBoard();
        showHUD();
        
        let move;
        if (currentPlayer === 1) {
            move = await getPlayerMove(); 
        } else {
            if (gameMode === MENU_PVC) {
                move = getRandomMove(); 
            } else {
                move = await getPlayerMove(); 
            }
        }

        updateGameBoardState(move);
        outcome = evaluateGameState();
        toggleCurrentPlayer();
    } while (outcome === OUTCOME_CONTINUE);

    displayGameSummary(outcome);
    return await askToPlayAgain();
}

async function askToPlayAgain() {
    const answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    return answer && answer.toLowerCase()[0] == language.CONFIRM;
}

function displayGameSummary(outcome) {
    clearScreen();

    if (outcome === OUTCOME_DRAW) {
        print(language.GAME_DRAW);
    } else {
        const winningPlayer = (outcome > 0) ? 1 : 2;
        print(language.WINNER.replace("{player}", winningPlayer));
    }

    displayGameBoard();
    print(language.GAME_OVER);
}

function toggleCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let state = checkRows() || checkColumns() || checkDiagonals();
    if (state) return state / WINNING_SUM;

    return isBoardFull() ? OUTCOME_DRAW : OUTCOME_CONTINUE;
}

function checkRows() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        const sum = gameboard[row].reduce((acc, cell) => acc + cell, 0);
        if (Math.abs(sum) === WINNING_SUM) return sum;
    }
    return 0;
}

function checkColumns() {
    for (let col = 0; col < GAME_BOARD_SIZE; col++) {
        const sum = gameboard.reduce((acc, row) => acc + row[col], 0);
        if (Math.abs(sum) === WINNING_SUM) return sum;
    }
    return 0;
}

function checkDiagonals() {
    const sum1 = gameboard.reduce((acc, row, i) => acc + row[i], 0);
    const sum2 = gameboard.reduce((acc, row, i) => acc + row[GAME_BOARD_SIZE - 1 - i], 0);
    
    return Math.abs(sum1) === WINNING_SUM ? sum1 : 
           Math.abs(sum2) === WINNING_SUM ? sum2 : 0;
}

function isBoardFull() {
    return gameboard.every(row => row.every(cell => cell !== EMPTY_CELL));
}

function updateGameBoardState(move) {
    const [row, col] = move;
    gameboard[row][col] = currentPlayer;
}

async function getPlayerMove() {
    let position;
    do {
        const rawInput = await askQuestion(language.PLACE_MARK);
        position = rawInput.split(" ").map(Number).map(num => num - PLAYER_INPUT_OFFSET);
    } while (!isValidPosition(position));

    return position;
}

function isValidPosition(position) {
    const [row, col] = position;
    return row >= 0 && row < GAME_BOARD_SIZE && col >= 0 && col < GAME_BOARD_SIZE &&
           gameboard[row][col] === EMPTY_CELL;
}

function showHUD() {
    const playerDescription = (currentPlayer === 1) ? language.PLAYER_1_DESC : language.PLAYER_2_DESC;
    print(playerDescription.replace("{player}", currentPlayer));
}

function displayGameBoard() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        const rowOutput = gameboard[row].map(cell => {
            if (cell === EMPTY_CELL) return MARKER_EMPTY;
            return cell === 1 ? ANSI.COLOR.GREEN + PLAYER_X + ANSI.RESET : ANSI.COLOR.RED + PLAYER_O + ANSI.RESET;
        }).join(" ");
        print(rowOutput);
    }
}

function initializeGame() {
    gameboard = Array.from({ length: GAME_BOARD_SIZE }, () => Array(GAME_BOARD_SIZE).fill(EMPTY_CELL));
    currentPlayer = 1; 
}

function clearScreen() {
    console.clear();
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomMove() {
    const validMoves = [];
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === EMPTY_CELL) {
                validMoves.push([row, col]);
            }
        }
    }
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

// Settings Functionality
async function showSettings() {
    clearScreen();
    print(language.SETTINGS);
    
    // Display language options
    print(language.LANGUAGE);
    print(language.LANGUAGE_ENGLISH);
    print(language.LANGUAGE_NORWEGIAN);

    const choice = await askQuestion("Select your option: ");
    switch (choice) {
        case "1":
            language = DICTIONARY.en;
            print(language.LANGUAGE_CONFIRM.replace("{language}", "English"));
            break;
        case "2":
            language = DICTIONARY.no;
            print(language.LANGUAGE_CONFIRM.replace("{language}", "Norsk"));
            break;
        default:
            print("Invalid choice. Returning to menu...");
    }

    await wait(2000); // Wait for 2 seconds before returning to the menu
}

// Start the game
startGame();
