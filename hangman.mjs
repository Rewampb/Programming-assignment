import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface( {input: process.stdin, output: process.stdout });

async function askQuestion(question) {
    return await rl.question(question);
}

import { ANSI } from './ansi.mjs';

const correctWord = "cat".toLowerCase;
const numberOfCharInWord = correctWord.length;
let guessedWord = "".padStart(correctWord.length, "_");
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];

console.log(HANGMAN.UI[HANGMAN.UI.length - 1]);

process.exit();//it terminate the program or function(make it stop)

for (let i = 0; i < numberOfCharInWord; i++) {
    wordDisplay = wordDisplay + guessedWord[i] + " ";
}

console.log(wordDisplay);

while (isGameOver == false) {

    console.log(ANSI.CLEAR_SCREEN);
    console.log(HANGMAN.UI[wrongGuesses.length]);

    const answer = (await askQuestion("Guess a character or the word : ")).toLowerCase();



    if (answer == correctWord) {
        isGameOver = true;
        wasGuessCorrect = true;
    } else if (ifPlayerGuessLetter(answer)) {
        guessedWord = "";
        let isCorrect = false;
        for (let i = 0; i < correctWord,length; i++) {
            if (correctWord[i] == answer) {
                guessedWord += answer;
                isCorrect = true;
            } else {
                guessedWord += org[i];
            }
        }

        if (isCorrect == false) {
            wrongGuesses .push(answer);
        }

        if (guessedWord == correctWord) {
            isCorrect = true;
            wasGuessCorrect = true;
        }

    } else {
        wrongGuesses.push(answer);
    }

    if (wrongGuesses.length == HANGMAN.UI.length){
        isGameOver = true;
    }
}

if(wasGuessCorrect) {
    console.log(ANSI.COLOR.YELLOW + "Congratualtion!, you won");
}

console.log("Game Over!");

function ifPlayerGuessLetter(answer) {
    return answer.length == 1
}