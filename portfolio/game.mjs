import * as fs from 'fs';
import * as readlinePromises from 'node:readline/promises';
import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';

const MAX_ATTEMPTS = 10; 
const PLACEHOLDER = "_";
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });
let totalWins = 0;
let totalGames = 0;

async function askQuestion(question) {
    return await rl.question(question);
}

function getWordsFromFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const words = data.split('\n').map(word => word.trim());
    return words.filter(word => word.length > 0);
}

function getRandomWordFromFile(filePath) {
    const words = getWordsFromFile(filePath);
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex].toLowerCase();
}

function drawWordDisplay(guessedWord) {
    let wordDisplay = "";
    for (let i = 0; i < guessedWord.length; i++) {
        if (guessedWord[i] != "_") {
            wordDisplay += ANSI.COLOR.GREEN;
        }
        wordDisplay = wordDisplay + guessedWord[i] + " ";
        wordDisplay += ANSI.RESET;
    }
    return wordDisplay;
}

function drawList(list, color) {
    let output = color;
    for (let i = 0; i < list.length; i++) {
        output += list[i] + " ";
    }
    return output + ANSI.RESET;
}

function endGame(wasGuessCorrect, correctWord, guessedWord, wrongGuesses) {
    console.log(ANSI.CLEAR_SCREEN);
    console.log(drawWordDisplay(guessedWord));
    console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);

    if (wasGuessCorrect) {
        console.log(ANSI.COLOR.YELLOW + "Congratulations, winner winner chicken dinner!");
    } else {
        console.log(`Game Over. The correct word was: ${correctWord}`);
    }
}

async function playGame(filePath) {
    const correctWord = getRandomWordFromFile(filePath);
    let guessedWord = PLACEHOLDER.repeat(correctWord.length);
    let wrongGuesses = [];
    let guessedLetters = new Set();
    let isGameOver = false;
    let wasGuessCorrect = false;

    while (!isGameOver) {
        console.log(ANSI.CLEAR_SCREEN); // Clear screen
        console.log(drawWordDisplay(guessedWord));
        console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
        console.log(HANGMAN_UI[wrongGuesses.length]);
        console.log(`Attempts left: ${MAX_ATTEMPTS - wrongGuesses.length}`);

        const answer = (await askQuestion("Guess a char or the word: ")).toLowerCase();

        if (guessedLetters.has(answer) && answer.length === 1) {
            console.log("You already guessed that letter!");
            continue;
        }

        guessedLetters.add(answer);

        const result = processGuess(answer, correctWord, guessedWord, wrongGuesses);
        guessedWord = result.updatedGuessedWord;
        wrongGuesses = result.updatedWrongGuesses;
        wasGuessCorrect = result.wasGuessCorrect;

        isGameOver = checkGameOver(guessedWord, correctWord, wrongGuesses);
    }

    await new Promise(resolve => {
        endGame(wasGuessCorrect, correctWord, guessedWord, wrongGuesses);
        setTimeout(resolve, 3000); // Wait for 3 seconds before proceeding to the next round
    });

    return wasGuessCorrect;
}


async function main() {
    let playAgain = true;

    while (playAgain) {
        totalGames++;
        const wasGuessCorrect = await playGame('words.txt');
        if (wasGuessCorrect) {
            totalWins++;
        }

        const answer = (await askQuestion("Do you want to try agin (yes/no): ")).toLowerCase();
        if (answer !== 'yes') {
            playAgain = false;
        }
    }
    console.log(`\nConclusion:`);
    console.log(`\nGames played: ${totalGames}`);
    console.log(`Wins: ${totalWins}`);
    console.log(`Losses: ${totalGames - totalWins}`);
    process.exit();
}

function processGuess(answer, correctWord, guessedWord, wrongGuesses) {
    let updatedGuessedWord = "";
    let isCorrect = false;

    if (answer === correctWord) {
        updatedGuessedWord = correctWord;
        isCorrect = true;
    } else if (answer.length === 1) { // Single character guess
        for (let i = 0; i < correctWord.length; i++) {
            if (correctWord[i] === answer) {
                updatedGuessedWord += answer;
                isCorrect = true;
            } else {
                updatedGuessedWord += guessedWord[i];
            }
        }

        if (!isCorrect) {
            wrongGuesses.push(answer);
        }
    } else { // Full-word guess
        wrongGuesses.push(answer);
        updatedGuessedWord = guessedWord; // No change to guessedWord
    }

    return {
        updatedGuessedWord: updatedGuessedWord,
        updatedWrongGuesses: wrongGuesses,
        wasGuessCorrect: updatedGuessedWord === correctWord
    };
}


function checkGameOver(guessedWord, correctWord, wrongGuesses) {
    return guessedWord === correctWord || wrongGuesses.length >= MAX_ATTEMPTS;
}

main();
