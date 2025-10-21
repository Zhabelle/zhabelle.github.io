const entryInput = document.getElementById("entryInput");
const entryList = document.getElementById("entryList");
const entryListEditor = document.getElementById("entryListEditor");
const ruleta = document.getElementById("ruleta");
const modal = document.querySelector("div.modal");
const saveRouletteModal = document.querySelector("div.saveRouletteModal");
const ruletaJolder = document.querySelector("div.rouletteHolder");
const winnerText = document.getElementById("winnerText");
const audioClave = document.getElementById("audioClave");
const saveRuletaNameInput = document.getElementById("ruletaName");
const savedRouletteSelector = document.getElementById("savedRouletteSelector");
const loadSavedRouletteBtn = document.getElementById("loadSavedRoulette");
const removeSavedRouletteBtn = document.getElementById("removeSavedRoulette");

let availableRoulettes = {};
let isSpinning = false;
let spinAmount = 0;
let spinSpeed = 0;
let maxSpinSpeed = 0;
let spinAccel = 1.0;
let spinTime = 0;
let reachedMaxSpeed = false;
let madeSound = false;
let winner;
let frameStart;

entryInput.addEventListener("keydown", e => {
    if(e.key === "Enter") {
        addEntry();
    }
});

function addEntry(entryName = undefined) {
    const name = entryName || entryInput.value;
    if(name) {
        const entry = document.createElement("div");
        entry.classList.add("entry");
        entry.innerHTML = createEntry(name);
        entryInput.value = "";
        entry.addEventListener("pointerenter", e=>{
            entry.classList.add("hovered");
        });
        entry.addEventListener("pointerleave", e=>{
            entry.classList.remove("hovered");
        });
        
        let color = entry.getAttribute("data-rulecolor");
        if(!color) {
            const lastColor = document.querySelector("#entryList .entry:last-child")?.getAttribute("data-rulecolor") || undefined;
            color = getRandomColor();
            while(color === lastColor) {
                color = getRandomColor();
            }
            entry.setAttribute("data-rulecolor", color);
        }
        entryList.appendChild(entry);

        entry.querySelector("button.hideEntry").addEventListener("click", e=>hideEntry(entry));
        entry.querySelector("button.deleteEntry").addEventListener("click", e=>deleteEntry(entry));

        onRouletteEntriesModified();
    }else {
        console.log("ANIMAL!");
    }
}

function hideWinnerEntry() {
    if(winner) {
        hideEntry(winner);
    }
}

function deleteWinnerEntry() {
    if(winner) {
        deleteEntry(winner);
    }
}

function hideEntry(entry) {
    entry.classList.toggle("hidden");
    onRouletteEntriesModified();
}

function deleteEntry(entry) {
    entryList.removeChild(entry);
    onRouletteEntriesModified();
    toggleModal(false);
}

function onRouletteEntriesModified() {
    const a = [...entryList.children].filter(e => !e.classList.contains("hidden"));
    ruleta.style = `--n: ${a.length}; transform: ${ruleta.style.transform || "none"};`;
    ruleta.innerHTML = "";
    a.forEach(entry => {
        const re = document.createElement("div");
        re.classList.add("rouletteEntry");
        re.setAttribute("data-rulecolor", entry.getAttribute("data-rulecolor"));
        const respan = document.createElement("span");
        respan.innerHTML = entry.firstElementChild.innerHTML;
        re.appendChild(respan);
        ruleta.appendChild(re);

        const rulentradas = [...document.querySelectorAll(".rouletteEntry")];
        for(let i=0; i<rulentradas.length; i++) {
            const rulentrada = rulentradas[i];
            const color = rulentrada.getAttribute("data-rulecolor");
            rulentrada.style = `transform: rotate(${-360 / rulentradas.length * i}deg); background-color: ${color}; ${a.length <= 1? "mask-image: none;": ""}`;
            rulentrada.firstChild.style = `transform: rotate(${rulentradas.length < 3 ? 360: 190/rulentradas.length+269.5}deg);`;
        }
    });
}

function getRandomColor() {
    const colors = [
        "#f0f0f0",
        "#f0c0c0",
        "#f0f0c0",
        "#f0c0f0",
        "#c0f0f0",
        "#c0f0c0",
        "#c0c0f0",
        "#f0d0c0",
        "#f0c0d0",
        "#d0f0c0",
        "#c0f0d0",
        "#d0c0f0",
        "#c0d0f0",
    ];
    return colors[(Math.random() * colors.length) | 0];
}

function toggleEntryEditor(btn) {
    const isHidden = entryListEditor.style.display === "none";
    if(isHidden) {
        entryListEditor.value = [...entryList.children].map(e=>e.innerText).join("\n");
    }else {
        entryList.innerHTML = "";
        ruleta.innerHTML = "";
        (entryListEditor.value.trim().split("\n") || []).forEach(addEntry);
        entryListEditor.value = "";
    }
    entryList.style.display = entryListEditor.style.display;
    entryListEditor.style.display = isHidden? "block": "none";
    btn.innerHTML = !isHidden? "📝": "✅";
}

function spinDaWheel(timestamp) {
    if(frameStart == undefined) {
        frameStart = timestamp;
    }
    const elapsed = timestamp - frameStart;
    if(spinSpeed > 0) {
        spinTime = elapsed / 1000.0 / 5.0;
        if(spinSpeed < 3) {
            spinSpeed -= spinAccel * 0.15;
        }else if(spinSpeed < 1) {
            spinSpeed -= spinAccel * 0.05;
        }else if(spinSpeed < 0.05) {
            spinSpeed -= spinAccel * 0.00125;
        }else {
            spinSpeed += (reachedMaxSpeed? 1.0: -1.0) * spinTime * spinAccel;
        }
        spinAmount += spinSpeed;
        const spispi = spinAmount % 360.0;
        ruleta.style.transform = `rotate(${spispi}deg)`;
        const spospo = 360.0 / ruleta.children.length;
        const rate = spispi % spospo;
        if(!madeSound &&  rate < spospo / 2) {
            madeSound = true;
            const au = audioClave.cloneNode();
            au.volume = 0.34;
            au.play();
        }else if(rate > spospo / 2) {
            madeSound = false;
        }
        requestAnimationFrame(spinDaWheel);
    }else {
        isSpinning = false;
        getWinner();
    }
}

function getWinner() {
    const getElementRotation = e => parseFloat(e.style.transform?.substring("rotate(".length).replaceAll(/[a-zA-Z\)\;]/g, "")) || 0;

    const ruletaRot = getElementRotation(ruleta);
    const queso = [...ruleta.children].map(e => {
        const meRot = getElementRotation(e);
        return [meRot, e];
    }).sort((a,b) => b[0] - a[0]);
    winner = queso[0][1];
    let i = 0;
    for(const q of queso) {
        if(q[0] <= -ruletaRot) {
            winner = q[1];
            break;
        }
        i++;
    }
    winnerText.innerHTML = winner.querySelector("span").innerHTML;
    let j = 0;
    for(const c of entryList.children) {
        if(!c.classList.contains("hidden")) {
            if(j === i) {
                winner = c;
                break;
            }
            j++;
        }
    }
    if(winner === queso[0][1]) {
        winner = entryList.firstElementChild;
    }
    toggleModal(true);
}

ruleta.addEventListener("click", e => {
    if(isSpinning || ruleta.children.length < 1) return;
    isSpinning = true;
    spinAccel = 0.1;
    spinTime = 0;
    winner = undefined;
    maxSpinSpeed = spinAccel * 500 + Math.random() * spinAccel * 250;
    spinSpeed = maxSpinSpeed - maxSpinSpeed / 10.0 - Math.random() * spinAccel * 20;
    frameStart = undefined;
    requestAnimationFrame(spinDaWheel);
});

let clickedModalBackground;
modal.addEventListener("pointerdown", e => {
    clickedModalBackground = e.target === modal;
});

modal.addEventListener("click", e => {
    if(clickedModalBackground && e.target === modal) {
        toggleModal(false);
    }
});

let clickedSaveModalBackground;
saveRouletteModal.addEventListener("pointerdown", e => {
    clickedSaveModalBackground = e.target === saveRouletteModal;
});

saveRouletteModal.addEventListener("click", e => {
    if(clickedSaveModalBackground && e.target === saveRouletteModal) {
        toggleSaveModal(false);
    }
});

function toggleModal(state) {
    modal.firstElementChild.animate(
        [{
            transform: "translate(0, -100px)",
        },{
            transform: "none",
            easing: "ease-in",
        }],
        {
            duration: 500,
            iterations: 1,
        }
    );
    modal.hidden = !state;
}

function toggleSaveModal(state) {
    saveRouletteModal.hidden = !state;
    saveRuletaNameInput.focus();
}

function saveRoulette() {
    const rulName = saveRuletaNameInput.value;
    if(!rulName) {
        console.log("¡ANIMAL!");
        return;
    }
    saveRuletaNameInput.value = "";
    toggleSaveModal(false);
    const savedData = JSON.parse(localStorage.getItem("ruletardas") || "{}");
    savedData[rulName] = [...entryList.children].map(e=>e.innerText);
    availableRoulettes = savedData;
    saveRouletteData();
}

function saveRouletteData() {
    localStorage.setItem("ruletardas", JSON.stringify(availableRoulettes));
    reloadSavedRoulettes();
}

function reloadSavedRoulettes() {
    availableRoulettes = JSON.parse(localStorage.getItem("ruletardas") || "{}");
    const ruletas = Object.keys(availableRoulettes);
    if(!ruletas || ruletas.length < 1) {
        loadSavedRouletteBtn.setAttribute("disabled", "disabled");
        savedRouletteSelector.setAttribute("disabled", "disabled");
        removeSavedRouletteBtn.setAttribute("disabled", "disabled");
    } else {
        loadSavedRouletteBtn.removeAttribute("disabled");
        savedRouletteSelector.removeAttribute("disabled");
        removeSavedRouletteBtn.removeAttribute("disabled");
    }
    savedRouletteSelector.innerHTML = Object.keys(availableRoulettes).map(k => `<option value="${k}">${k}</option>`).join("\n");
}

function loadSavedRoulette() {
    const entries = availableRoulettes[savedRouletteSelector.value];
    if(entries && entries.length > 0) {
        entryList.innerHTML = "";
        entries.forEach(e => addEntry(e));
    }
}

function removeSavedRoulette() {
    if(confirm(`¿Seguro que desea eliminar esta ruleta ('${savedRouletteSelector.value}')?`)) {
        delete availableRoulettes[savedRouletteSelector.value];
        saveRouletteData();
    }
}

function createEntry(name) {
    return `<span>${name}</span>
            <div>
                <button type="button" class="hideEntry">👁️</button>
                <button type="button" class="deleteEntry">🗑️</button>
            </div>`;
}

document.addEventListener("DOMContentLoaded", _ => {
    reloadSavedRoulettes();
});

addEntry("hola");
