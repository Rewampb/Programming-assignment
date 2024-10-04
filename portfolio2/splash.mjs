import { ANSI } from "./ansi.mjs"; 

const ART = `
 ${ANSI.COLOR.GREEN} ______  ____   __      ______   ____    __      ______   ___     ___
 ${ANSI.COLOR.RED} |      ||    | /  ]    |      | /    |  /  ]    |      | /   \\   /  _]
 ${ANSI.COLOR.YELLOW}|      | |  | /  /     |      ||  o  | /  /     |      ||     | /  [_
 ${ANSI.COLOR.BLUE} |_|  |_| |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]
 ${ANSI.COLOR.MAGENTA}  |  |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_
  ${ANSI.COLOR.CYAN} |  |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |
  ${ANSI.COLOR.RESET}|__|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|
`;

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;
