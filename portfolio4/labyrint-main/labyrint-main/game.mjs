import Labyrinth from "./labyrinth.mjs";
import ANSI from "./utils/ANSI.mjs";
import SplashScreen from "./splashScreen.mjs";

const REFRESH_RATE = 250;

console.log(ANSI.RESET, ANSI.CLEAR_SCREEN, ANSI.HIDE_CURSOR);

let intervalID = null;
let isBlocked = false;
let state = null;
let splash = new SplashScreen();

function initGame() {
    state = new Labyrinth();
    intervalID = setInterval(updateGame, REFRESH_RATE);
}

function updateSplash() {
    if (isBlocked) return;
    isBlocked = true;

    splash.update();
    splash.draw();

    if (splash.isFinished()) {
        clearInterval(intervalID);
        initGame();
    }

    isBlocked = false;
}

function updateGame() {
    if (isBlocked) return;
    isBlocked = true;

    try {
        state.update();
        state.draw();
    } catch (error) {
        console.error("Error during game update:", error);
        clearInterval(intervalID);
        console.log(ANSI.RESET, ANSI.SHOW_CURSOR);
    }

    isBlocked = false;
}

intervalID = setInterval(updateSplash, REFRESH_RATE);