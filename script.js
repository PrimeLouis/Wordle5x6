// Variabler och start
let WORD = "";  // Hemliga ord
let currentGuess = "";
let attempts = 0;
const maxAttempts = 6;
let wordList = [];  // Listan fylls på automatisk via json "arrays"

//fetch,slumpmässigt
async function loadWord() {
    try {
        const response = await fetch("wordle.json");
        wordList = await response.json();
        WORD = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
        console.log("Hemligt ord:", WORD);
    } catch (error) {
        console.error("Fel vid inläsning av ord:", error);
    }
}

// spelbräda, tangentbord för att fylla på spelbrädan
function createBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = "";
    for (let i = 0; i < maxAttempts * 5; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("id", `cell-${i}`);
        board.appendChild(cell);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
    
    keys.forEach(key => {
        const keyDiv = document.createElement("div");
        keyDiv.classList.add("key");
        keyDiv.textContent = key;
        keyDiv.addEventListener("click", () => handleKeyClick(key));
        keyboard.appendChild(keyDiv);
    });
// Skapar delete och enter knappar
    const deleteKey = document.createElement("div");
    deleteKey.classList.add("key");
    deleteKey.textContent = "Del";
    deleteKey.addEventListener("click", handleDelete);
    keyboard.appendChild(deleteKey);

    const enterKey = document.createElement("div");
    enterKey.classList.add("key");
    enterKey.textContent = "⏎";
    enterKey.addEventListener("click", submitGuess);
    keyboard.appendChild(enterKey);
}

// uppdaterar spelbrädan för bokstaven fylls på i currentGuess
function handleKeyClick(key) {
    if (currentGuess.length < 5) {
        currentGuess += key;
        updateGrid();
    }
}

function handleDelete() {
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    }
}

// Uppdatera brädet
function updateGrid() {
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${attempts * 5 + i}`);
        cell.textContent = currentGuess[i] || "";
    }
}

// Skicka gissning och kontrollera giltighet
function submitGuess() {
    if (currentGuess.length !== 5) {
        showPopup("Skriv in 5 bokstäver!");  
        return;
    }
    if (!wordList.includes(currentGuess.toLowerCase())) {
        showPopup("Ordet finns inte i listan!");  
        return;
    }
    if (attempts < maxAttempts) {
        checkGuess(currentGuess);
        currentGuess = "";  
        attempts++;
    } else {
        alert("Game over! Du har använt alla dina försök!");
        document.getElementById("retry-container").style.display = "block";
    }
}

// Kontrolleras och ger feedback
function checkGuess(guess) {
    const guessArray = guess.split("");
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${attempts * 5 + i}`);
        const letter = guessArray[i];
        cell.classList.remove("correct", "present", "absent");

        if (letter === WORD[i]) {
            cell.classList.add("correct");
            updateKeyboardKey(letter, "correct");
        } else if (WORD.includes(letter)) {
            cell.classList.add("present");
            updateKeyboardKey(letter, "present");
        } else {
            cell.classList.add("absent");
            updateKeyboardKey(letter, "absent");
        }
    }
    if (guess === WORD) {
        alert("Grattis! Du har gissat på rätt ord!");
        document.getElementById("retry-container").style.display = "block";
    } else if (attempts === maxAttempts - 1) {
        alert(`Game Over! Ordet var ${WORD}.`);
        document.getElementById("retry-container").style.display = "block";
    }
}

// 
function updateKeyboardKey(letter, feedback) {
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        if (key.textContent === letter) {
            if (!key.classList.contains("correct") && !key.classList.contains("present") && !key.classList.contains("absent")) {
                key.classList.add(feedback);
            } else {
                const currentClass = key.classList[1];
                if (currentClass !== feedback) {
                    key.classList.remove(currentClass);
                    key.classList.add(feedback);
                }
            }
        }
    });
}

// input via fysiska tangenttryckningar
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (!document.getElementById("popup-container").classList.contains("hidden")) {
            closePopup();
        } else {
            submitGuess();
        }
    } else if (event.key === "Backspace") {
        handleDelete();
    } else if (/^[a-zA-Z]$/.test(event.key) && currentGuess.length < 5) {
        handleKeyClick(event.key.toUpperCase());
    }
});

// Byt tema och färgblindläge
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const themeButton = document.getElementById("theme-toggle");
    themeButton.textContent = document.body.classList.contains("dark-mode") ? "Byt till ljus läge" : "Byt till mörkt läge";
});

document.getElementById("colorblind-toggle").addEventListener("click", () => {
    document.body.classList.toggle("colorblind-mode");
    const colorblindButton = document.getElementById("colorblind-toggle");
    colorblindButton.textContent = document.body.classList.contains("colorblind-mode") ? "Byt till normalt läge" : "Byt till färgblindläge";
});

// Visa och stäng popup
function showPopup(message) {
    const popupMessage = document.getElementById("popup-message");
    popupMessage.textContent = message;
    document.getElementById("popup-container").classList.remove("hidden");
}

function closePopup() {
    document.getElementById("popup-container").classList.add("hidden");
}

// Återställ spelet
function retryGame() {
    currentGuess = "";
    attempts = 0;
    document.getElementById("game-board").innerHTML = "";
    loadWord().then(() => {
        createBoard();
        createKeyboard(); 
    });
    document.getElementById("retry-container").style.display = "none";
}

// Starta spelet vid sidladdning
window.onload = function() {
    loadWord().then(() => {
        createBoard();
        createKeyboard(); 
    });
};