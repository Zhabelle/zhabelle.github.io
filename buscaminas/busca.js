const boardSizeInput = document.getElementById("boardSize");
const mineCountInput = document.getElementById("mineCount");

const board = document.querySelector("div.tablero");
const boardData = []; // guardar bombosos aquí para que no se sepa desde el frente ?

let boardSize;
let mineCount;
let win;
let startTime;
let intervalo;

function regenBoard() {
    board.innerHTML = "";
    startTime = undefined;
    taimaa.innerHTML = "00:00";
    boardSize = parseInt(boardSizeInput.value);
    mineCount = parseInt(mineCountInput.value);
    if(mineCount > boardSize * boardSize) {
        alert("¡ANIMAL!");
        return;
    }
    for(let i=0; i<boardSize*boardSize; i++) {
        const btn = document.createElement("button");
        btn.classList = "tile";
        btn.setAttribute("data-tile-index", i);
        btn.addEventListener("click", tileClick);
        btn.addEventListener("contextmenu", tileFlag);
        board.appendChild(btn);
    }
    boardData.length = 0;
    let curMinas = 0;
    while(curMinas < mineCount) {
        const index = (Math.random() * boardSize * boardSize) | 0;
        if(!boardData.includes(index)){
            curMinas++;
            boardData.push(index);
        }
    }
    boardData.sort();
    board.style.width = board.style.height = `${boardSize * 2.5}em`;
    board.style.gridTemplateRows = `repeat(${boardSize}, 2.5em)`;
    board.style.gridTemplateColumns = `repeat(${boardSize}, 2.5em)`;
}

function tileFlag(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if(evt.target.classList.contains("discovered")) return;
    evt.target.classList.toggle("flagged");
}

function tileClick(evt) {
    if(!startTime) startTime = Date.now();
    if(evt.target.classList.contains("flagged")) return;
    const clickedTile = parseInt(evt.target.getAttribute("data-tile-index"));
    evt.target.classList.add("discovered");
    if(boardData.includes(clickedTile)) {
        // explode
        evt.target.innerHTML = "X";
        evt.target.style.color = "red";
        document.querySelectorAll("button.tile:not(.discovered)").forEach(e => {
            const isFlagged = e.classList.contains("flagged");
            const isMine = boardData.includes(parseInt(e.getAttribute("data-tile-index")));
            if(isFlagged && !isMine) {
                e.classList.add("badFlag");
            }
            if(!isFlagged && isMine) {
                e.classList.add("hiddenMine");
                e.innerHTML = "X";
            }
        });
        setTimeout(() => {
            alert("ded");
            regenBoard();
        }, 200);
    }else {
        const closeMines = boardData.filter(i => {
            return validTile(clickedTile, i);
        }).length;
        if(closeMines > 0) {
            evt.target.innerHTML = closeMines;
        }else {
            for(let i=-1; i<2; i++){ 
                for(let j=-1; j<2; j++){ 
                    if(i === 0 && j === 0) continue;
                    const otherTile = j*boardSize + i + clickedTile;
                    if(!validTile(clickedTile, otherTile)) continue;
                    const ot = document.querySelector(`button.tile[data-tile-index='${otherTile}']:not(.discovered)`);
                    if(ot && !clickQueue.includes(ot)) {
                        clickQueue.push(ot);
                    }
                }
            }
        }
        if(clickQueue.length > 0 && intervalo == undefined) {
            intervalo = setInterval(consumeQueue);
        }
        evt.target.style.color = getTileNumberColor(closeMines);

        if(!win && document.querySelectorAll("button.tile.discovered").length >= boardSize * boardSize - mineCount) {
            win = true;
            setTimeout(() => {
                alert("🎉");
                win = false;
                regenBoard();
            }, 100);
        }
    }
}

function validTile(a,b) {
    if(b > boardSize * boardSize || b < 0) return false;
    const x1 = a % boardSize;
    const x2 = b % boardSize;
    const y1 = (a / boardSize) | 0;
    const y2 = (b / boardSize) | 0;
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

function getTileNumberColor(count) {
    return ["green","lime","orange","red","crimson","darkorchid","darkmagenta","indigo","black"][Math.min(count, 8)];
}

let clickQueue = [];
const taimaa = document.getElementById("taimaa");
let animframeStart;
function queueClicker(timestamp) {
    if(animframeStart == undefined) {
        animframeStart = timestamp;
    }
    const elapsed = timestamp - animframeStart;
    if(startTime && elapsed > 1000) {
        animframeStart = timestamp;
        time = (Date.now() - startTime) / 1000;
        const padder = x => String(x | 0).padStart(2, "0");
        taimaa.innerHTML = `${padder(time / 60)}:${padder(time % 60)}`
    }
    requestAnimationFrame(queueClicker);
}

function consumeQueue() {
    if(clickQueue.length > 0){
        const c = Math.min(16, clickQueue.length);
        for(let i=0; i<c; i++) {
            clickQueue.shift().click();
        }
    }else {
        clearInterval(intervalo);
        intervalo = undefined;
    }
}

requestAnimationFrame(queueClicker);

regenBoard();
