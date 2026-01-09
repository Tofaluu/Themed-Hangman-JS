/* --- DATA from words.py --- */
const wordLists = {
    winter: ["Jingle Bells","Snowman","Merry Christmas","Happy New Year","Hot Chocolate","Santa Claus","Snowflakes","Christmas Eve","Candy Cane","Reindeer","Presents","Gingerbread Man","Gingerbread House","Frostbite","December","Shoveling","Blizzard","Mistletoe","Rudolph","Frozen"],
    school: ["Homework","Pencil","Notebook","Backpack","Teacher","Mr Farid","White Board","School Bus","Schedule","Lunch Box","Calculator","Computer","Science","Mathematics","Phys Ed","Eraser","Academic","Scissors","Stapler","Recess"],
    movie: ["Harry Potter", "Toy Story", "The Lego Movie", "Oppenheimer", "Barbie", "Star Wars", "The Lion King", "The Matrix", "Spiderman", "Despicable Me", "The Shawshank Redemption", "Pulp Fiction", "Inception", "Back to the Future", "Spirited Away", "Good Will Hunting", "Citizen Kane", "Indiana Jones", "Jurassic Park", "Finding Nemo"],
    food: ["Pizza","Ice Cream","Macaroni and Cheese","French Fries","Sushi","Popcorn","Strawberries","Hamburger","Cereal","Broccoli","Tacos","Sandwich","Hot Dog","Pancakes","Waffles","Lasagna","Bacon","Chocolate", "Pasta","Chicken Nuggets"],
    place: ["Canada","Puerto Rico","Greece","Italy","Australia","France","Times Square","Japan","Iceland","America","Dubai","Costa Rica","Madagascar","Bahamas","China","Hawaii","Paris","Oakville","Dominican Republic","South Korea"],
    company: ["Apple","Gucci","Disney","Google","Supreme","McDonalds","Warner Bros","Nike","Champion","Pandora","Walmart","American Eagle","Aritzia","Coca Cola","Pepsi","Roots","Starbucks","Samsung","Nintendo","Microsoft"]
};

/* --- DATA from hangman.py --- */
// Note: \n characters are preserved for the <pre> tag
const hangmanArt = {
    winter: ["            ______\n           |      |", "\n          [________]", "\n           /      \\\n          |  O  O  |", "\n           \\  ::> /", "\n        \\  /      \\  /", "\n         \\/    O   \\/", "\n          |        |\n           \\   O  /", "\n           /      \\\n          /        \\", "\n          |        |", "\n          \\________/"],
    school: ["          /\\","\n         /__\\", "\n        |  | |", "\n        |  | |", "\n        |  | |", "\n        |  | |", "\n        |  | |", "\n        |  | |", "\n        ------", "\n        |____|"],
    movie: ["           oo", "oo", "\n          ooo", "ooo", "\n         ---------", "\n         | | | | |", "\n         | | | | |", "\n         | | | | |", "\n         | | | | |", "\n         ---------"],
    food: ["            /\\", "\n           /0 \\", "\n          /  * \\", "\n         /0   0 \\", "\n        /* (    \\", "\n       /  0   0 * \\", "\n      /0 * ", ")   0 \\", "\n      --------------", "\n      --------------"],
    place: ["                    ___", "\n          __       (   )", "\n        /    \\   ", "( _____ )", "\n        \\ __ /", "\n                     /|", "\n     ,______________/ |", "\n    /|  O O O O O O   |", "\n   (_|_____/__/_______|", "\n         / /\n        //"],
    company: ["      ________________________", "\n     |  |      _|_|_       |  |", "\n     |  |     / | | \\      |  |", "\n     |  |     \\ | |        |  |", "\n     |  |      -|-", "|-       |  |", "\n     |  |       | | \\      |  |", "\n     |  |     \\_|_|_/      |  |", "\n     |  |       | |        |  |", "\n     |__|__________________|__|"]
};

/* --- Game Variables --- */
let currentTheme = "";
let currentWord = "";
let activeWordList = [];
let guessedLetters = []; // Stores letters user has guessed
let mistakes = 0; // Tracks hangmanIndex
let score = 0;
let highScore = 0;

/* --- DOM Elements --- */
const themeScreen = document.getElementById('theme-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const goodbyeScreen = document.getElementById('goodbye-screen');
const statsBar = document.getElementById('stats-bar');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const hangmanEl = document.getElementById('hangman-art');
const wordDisplayEl = document.getElementById('word-display');
const messageEl = document.getElementById('message-area');
const inputEl = document.getElementById('letter-input');

/* --- Functions --- */

function startGame(theme) {
    currentTheme = theme;
    // Create a copy of the list so we can remove words as we go
    activeWordList = [...wordLists[theme]]; 
    score = 0;
    mistakes = 0;
    
    updateStats();
    
    // Switch screens
    themeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    statsBar.classList.remove('hidden');
    
    loadNextWord();
}

function loadNextWord() {
    // Reset round variables
    guessedLetters = [];
    mistakes = 0;
    inputEl.value = "";
    messageEl.textContent = "";
    
    if (activeWordList.length === 0) {
        // Special condition from main.py: if 20 points (all words done)
        alert(`Wait...What??? You completed all ${currentTheme} words! Good job!`);
        endGame(true);
        return;
    }

    // Pick random word and remove it from list
    const randomIndex = Math.floor(Math.random() * activeWordList.length);
    currentWord = activeWordList[randomIndex];
    activeWordList.splice(randomIndex, 1); // Remove word

    updateDisplay();
}

function updateDisplay() {
    // 1. Update ASCII Art
    // We build the string based on how many mistakes (hangmanIndex)
    let artString = "";
    const currentArtArray = hangmanArt[currentTheme];
    
    // Safety check in case mistakes exceed array length
    const limit = Math.min(mistakes, currentArtArray.length);
    
    for(let i = 0; i < limit; i++) {
        artString += currentArtArray[i];
    }
    hangmanEl.textContent = artString;

    // 2. Update Word Display (Underscores)
    let displayString = "";
    let isWin = true;

    for (let char of currentWord) {
        if (char === " ") {
            displayString += "\u00A0\u00A0"; // Double non-breaking space for visual gap
        } else if (guessedLetters.includes(char.toLowerCase())) {
            displayString += char + " ";
        } else {
            displayString += "_ ";
            isWin = false;
        }
    }
    wordDisplayEl.textContent = displayString;

    // 3. Check Game State
    if (isWin) {
        handleWin();
    } else if (mistakes >= 10) { // Hardcoded limit from main.py
        handleLoss();
    }
}

function handleGuess() {
    const guess = inputEl.value.toLowerCase();
    inputEl.value = ""; // Clear input
    inputEl.focus();

    // Validation
    if (!guess || guess.length !== 1 || !/[a-z]/.test(guess)) {
        messageEl.textContent = "Invalid input. Please enter a letter.";
        return;
    }
    if (guessedLetters.includes(guess)) {
        messageEl.textContent = "You already guessed that letter!";
        return;
    }

    // Process Valid Guess
    messageEl.textContent = ""; // Clear errors
    guessedLetters.push(guess);

    if (currentWord.toLowerCase().includes(guess)) {
        // Correct guess
        updateDisplay();
    } else {
        // Incorrect guess
        mistakes++;
        updateDisplay();
    }
}

function handleWin() {
    score++;
    updateStats();
    // Small delay so user sees the completed word before switching
    setTimeout(() => {
        messageEl.textContent = "Correct! Moving to next word...";
        loadNextWord();
    }, 1000);
}

function handleLoss() {
    // Update high score
    if (score > highScore) {
        highScore = score;
    }
    updateStats();
    endGame(false);
}

function endGame(isVictory) {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('final-score-msg');
    
    if (isVictory) {
        title.textContent = "You Won the Theme!";
    } else {
        title.textContent = "Game Over!";
    }
    
    msg.textContent = `You got ${score} point(s). High Score: ${highScore}`;
}

function resetGame(playAgain) {
    gameOverScreen.classList.add('hidden');
    
    if (playAgain) {
        // Go back to theme selection
        themeScreen.classList.remove('hidden');
        // If the Python logic implies "refilling" words, we do that in startGame()
    } else {
        statsBar.classList.add('hidden');
        goodbyeScreen.classList.remove('hidden');
    }
}

function updateStats() {
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
}

// Allow pressing "Enter" to submit guess
inputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleGuess();
    }
});