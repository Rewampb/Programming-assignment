import ANSI from "./utils/ANSI.mjs";


const frames = [
`
 ██▓    ▄▄▄      
▓██▒   ▒████▄    
▒██░   ▒██  ▀█▄  
▒██░   ░██▄▄▄▄██ 
░██████▒▓█   ▓██▒
░ ▒░▓  ░▒▒   ▓▒█░
░ ░ ▒  ░ ▒   ▒▒ ░
  ░ ░    ░   ▒   
    ░  ░     ░  ░
                       
`,
`
 ██▓    ▄▄▄       ▄▄▄▄ ▓██   ██▓ 
▓██▒   ▒████▄    ▓█████▄▒██  ██▒
▒██░   ▒██  ▀█▄  ▒██▒ ▄██▒██ ██░
▒██░   ░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░
░██████▒▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░
░ ▒░▓  ░▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ 
░ ░ ▒  ░ ▒   ▒▒ ░▒░▒   ░▓██ ░▒░   
  ░ ░    ░   ▒    ░    ░▒ ▒ ░░    
    ░  ░     ░  ░ ░     ░ ░        
                       ░░ ░
`,
`
 ██▓    ▄▄▄       ▄▄▄▄ ▓██   ██▓ ██▀███   ██▓ 
▓██▒   ▒████▄    ▓█████▄▒██  ██▒▓██ ▒ ██▒▓██▒ 
▒██░   ▒██  ▀█▄  ▒██▒ ▄██▒██ ██░▓██ ░▄█ ▒▒██▒▓
▒██░   ░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░▒██▀▀█▄  ░██░▓
░██████▒▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░░██▓ ▒██▒░██░▒
░ ▒░▓  ░▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ ░ ▒▓ ░▒▓░░▓  ░ 
░ ░ ▒  ░ ▒   ▒▒ ░▒░▒   ░▓██ ░▒░   ░▒ ░ ▒░ ▒ ░░ 
  ░ ░    ░   ▒    ░    ░▒ ▒ ░░    ░░   ░  ▒ ░   
    ░  ░     ░  ░ ░     ░ ░        ░      ░   
                       ░░ ░
`,
`
 ██▓    ▄▄▄       ▄▄▄▄ ▓██   ██▓ ██▀███   ██▓ ███▄    █ ▄▄▄█████▓ ██░ ██
▓██▒   ▒████▄    ▓█████▄▒██  ██▒▓██ ▒ ██▒▓██▒ ██ ▀█   █ ▓  ██▒ ▓▒▓██░ ██▒
▒██░   ▒██  ▀█▄  ▒██▒ ▄██▒██ ██░▓██ ░▄█ ▒▒██▒▓██  ▀█ ██▒▒ ▓██░ ▒░▒██▀▀██░
▒██░   ░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░▒██▀▀█▄  ░██░▓██▒  ▐▌██▒░ ▓██▓ ░ ░▓█ ░██
░██████▒▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░░██▓ ▒██▒░██░▒██░   ▓██░  ▒██▒ ░ ░▓█▒░██▓
░ ▒░▓  ░▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ ░ ▒▓ ░▒▓░░▓  ░ ▒░   ▒ ▒   ▒ ░░    ▒ ░░▒░▒
░ ░ ▒  ░ ▒   ▒▒ ░▒░▒   ░▓██ ░▒░   ░▒ ░ ▒░ ▒ ░░ ░░   ░ ▒░    ░     ▒ ░▒░ ░
  ░ ░    ░   ▒    ░    ░▒ ▒ ░░    ░░   ░  ▒ ░   ░   ░ ░   ░       ░  ░░ ░
    ░  ░     ░  ░ ░     ░ ░        ░      ░           ░           ░  ░  ░
                       ░░ ░
`
];


class SplashScreen {

    constructor(duration = 3000, frameInterval = 500) {
        this.frames = frames;
        this.duration = duration;
        this.frameInterval = frameInterval;
        this.currentFrame = 0;
        this.startTime = null;
        this.dirty = true;
        this.finished = false;
    }

    update() {
        if (!this.startTime) {
            this.startTime = Date.now();
        }
        
        if (Date.now() - this.startTime >= this.duration) {
            this.finished = true;
        } else {
            const elapsed = Date.now() - this.startTime;
            this.currentFrame = Math.floor(elapsed/this.frameInterval) % this.frames.length;
            this.dirty = true;
        }
    }

    draw() {
        if (this.dirty) {
            this.dirty = false;
            console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
            console.log(this.frames[this.currentFrame]);
        }
    }

    isFinished() {
        return this.finished;
    }

}

export default SplashScreen;