const gameCanvas = document.getElementById("snekGem");
const ctx = gameCanvas.getContext("2d");

class GameEntity {
    position = [0, 0];

    constructor(posX = 0, posY = 0) {
        this.position = [posX, posY];
    }

    draw() {}
}

class Snek extends GameEntity{
    constructor(posX = 0, posY = 0) {
        super(posX, posY);
    }

    move(speed) {
        this.position[0] += speed[0];
        this.position[1] += speed[1];
    }

    draw(color, isHead = false) {
        ctx.fillStyle = snekDed? "#c04040": color;
        ctx.fillRect(this.position[0] * squareSize, this.position[1] * squareSize, squareSize, squareSize);
    }
}

class SnekHead extends Snek {
    tail = [];

    constructor(posX = 0, posY = 0) {
        super(posX, posY);
    }

    move(speed) {
        let prePos = [...this.position];
        super.move(speed);
        for(let t of this.tail) {
            const tempPos = [...t.position];
            t.position = prePos;
            prePos = tempPos;
        }
    }

    draw(color = "#d0f0f0") {
        super.draw(color, true);
        const colors = ["#d06060", "#d0d060", "#60d060", "#60d0d0", "#6060d0", "#d060d0"];
        let i = 0;
        for(let t of this.tail) {
            t.draw(colors[i]);
            i++;
            if(i >= colors.length) {
                i = 0;
            }
        }
    }
}

class Fruta extends GameEntity {
    image = new Image(squareSize, squareSize);

    constructor(posX, posY) {
        super(posX, posY);
        this.image.src = "./fruta.png";
    }

    draw() {
        ctx.drawImage(this.image, this.position[0] * squareSize, this.position[1] * squareSize, squareSize, squareSize);
    }
}

const gridSize = 21; // w*h
let squareSize = 24; //NO // calculated value based on gridSize and canvas size
let snek = new SnekHead();
let nextSpeed = [0, 0];
let snekSpeed = [0, 0];
let snekDed = false;
let gamePaused = false;
let fruta;

function startSnek() {
    gameCanvas.width = gridSize * squareSize;
    gameCanvas.height = gridSize * squareSize;
    //squareSize = parseInt(gameCanvas.width / gridSize);
    drawGameBg();
    snek.position = [7, 10];
    for(let i=0; i<3; i++) {
        addSnekTail(true);
    }
    spawnFruta();
}

function drawGameBg() {
    ctx.fillStyle = "#c0a0a0";
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = "#a07070";
    for(let i=0; i<gridSize; i++) {
        for(let j=0; j<gridSize; j++) {
            if(j % 2 === i % 2) continue;
            ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
        }
    }
}

function addSnekTail(isNewSnek = false) {
    let pos = snek.tail.length > 0? snek.tail[snek.tail.length - 1].position: snek.position;
    if(isNewSnek) {
        snek.tail.push(new Snek(pos[0] - 1, pos[1]));
    }else {
        snek.tail.push(new Snek(pos[0], pos[1]));
    }
    snek.tail.push();
}

function spawnFruta() {
    let validPos = false;
    let pos;
    while(!validPos) {
        pos = [(Math.random() * gridSize) | 0, (Math.random() * gridSize) | 0];
        if(!(snek.position[0] === pos[0] && snek.position[1] === pos[1])) {
            validPos = true;
            snek.tail.forEach(t => {
                if(t.position[0] === pos[0] && t.position[1] === pos[1]) {
                    validPos = false;
                    return;
                }
            });
        }
    }
    if(fruta === undefined)
        fruta = new Fruta(pos[0], pos[1]);
    else
        fruta.position = pos;
}

function restartGame() {
    snek.tail.length = 0;
    snek = new SnekHead(7, 10);
    snekDed = false;
    snekSpeed = [0, 0];
    nextSpeed = [0, 0];
    gamePaused = false;
    // score = 0; // TODO
    startSnek();
}

let start;
const fps = 60;
function tick(timestamp) {
    if(start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawGameBg();
    snek.draw();
    fruta?.draw();

    if(elapsed > fps) {
        start = timestamp;

        if(snekDed || gamePaused) {
            // show ded / pause message ?
        } else {
            // movement
            if(snekSpeed.every(a => a === 0) || (snekSpeed[0] != -nextSpeed[0] && snekSpeed[1] != -nextSpeed[1]))
                snekSpeed = nextSpeed;

            if(snekSpeed[0] !== 0 || snekSpeed[1] !== 0){
                snek.move(snekSpeed);
            }

            if(snek.position[0] >= gridSize) {
                snek.position[0] = 0;
            }

            if(snek.position[0] < 0) {
                snek.position[0] = gridSize - 1;
            }

            if(snek.position[1] >= gridSize) {
                snek.position[1] = 0;
            }

            if(snek.position[1] < 0) {
                snek.position[1] = gridSize - 1;
            }
        
            // eat fruta
            if(snek.position[0] === fruta.position[0] && snek.position[1] === fruta.position[1]) {
                spawnFruta();
                addSnekTail();
            }
    
            // eat self
            snek.tail.forEach(t => {
                if(snek.position[0] === t.position[0] && snek.position[1] === t.position[1]) {
                    snekDed = true;
                }
            });
        }
    }

    requestAnimationFrame(tick);
}

addEventListener("keydown", e => {
    switch(e.key) {
        case "w":
        case "ArrowUp":
            nextSpeed = [0, -1];
            break;
        case "a":
        case "ArrowLeft":
            nextSpeed = [-1, 0];
            break;
        case "s":
        case "ArrowDown":
            nextSpeed = [0, 1];
            break;
        case "d":
        case "ArrowRight":
            nextSpeed = [1, 0];
            break;
        case " ":
            if(snekDed) {
                restartGame();
                break;
            }
        case "Escape":
            gamePaused = !gamePaused;
            break;
    }
    console.log("pressed '" + e.key + "'");
});

addEventListener("load", e => {
    startSnek();
    tick();
});
