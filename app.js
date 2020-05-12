"use strict";
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [0, 4, 8],
];
const forkIndexes = [
    [1, 2, 3, 4, 6, 8],
    [0, 2, 4, 7],
    [0, 1, 4, 5, 6, 8],
    [0, 4, 5, 6],
    [0, 1, 2, 3, 5, 6, 7, 8],
    [2, 3, 4, 8],
    [0, 2, 3, 4, 7, 8],
    [1, 4, 6, 8],
    [0, 2, 4, 5, 6, 7],
];
const corners = [0, 2, 6, 8];
let board = [];
let indexesPlayed = [];
let player;
let numberOfPlays;
let algoScore = 0, playerScore = 0, drawScore = 0;
function start() {
    board = [];
    indexesPlayed = [];
    player = Math.random() > 0.5;
    numberOfPlays = 0;
    document.getElementById("start").style.visibility = "hidden";
    const cells = document.querySelectorAll(".cell");
    cells.forEach((x) => {
        x.addEventListener("click", clicked, { once: true });
        x.classList.remove("x", "o");
        x.style.cursor = "pointer";
    });
    if (!player) {
        switchBoardClass(player);
        let shuffled = shuffle(corners)[2];
        console.log("Move to " + shuffled);
        codesTurn(shuffled);
    }
    return switchBoardClass(!player);
}
window.onload = () => {
    start();
};
function clicked(e) {
    play(+e.target.id);
}
function play(id) {
    numberOfPlays++;
    indexesPlayed.push(id);
    board[id] = player;
    let element = document.getElementById(`${id}`);
    element.style.cursor = "not-allowed";
    player ? element.classList.add("x") : element.classList.add("o");
    switchBoardClass(player);
    const state = board.reduce((acc, curr, currIndex) => (curr === player ? acc.concat(currIndex) : acc), []);
    if (hasWon(winningCombos.entries(), state))
        return declareWinner(player);
    if (checkTie(indexesPlayed))
        return declareTie();
    player = !player;
    if (player == false) {
        const codePlays = board.reduce((acc, curr, currIndex) => (curr === player ? acc.concat(currIndex) : acc), []);
        const opponentPlays = board.reduce((acc, curr, currIndex) => curr === !player ? acc.concat(currIndex) : acc, []);
        if (numberOfPlays === 3) {
            if ((opponentPlays.includes(2) && opponentPlays.includes(6)) ||
                (opponentPlays.includes(0) && opponentPlays.includes(8))) {
                let side = emptySide(indexesPlayed);
                console.log("Move to emptySide " + side);
                return codesTurn(side);
            }
        }
        if (numberOfPlays === 2) {
            if (codePlays.every((x) => x % 2 === 0) &&
                opponentPlays.includes(4)) {
                let corner = oppositeCorner(codePlays, indexesPlayed);
                console.log("Move to corner " + corner);
                return codesTurn(corner);
            }
        }
        const win = canWin(winningCombos.entries(), codePlays, indexesPlayed);
        if (win || win === 0) {
            console.log("Win on cell " + win);
            return codesTurn(win);
        }
        const canBlockWin = blockWin(winningCombos.entries(), opponentPlays, indexesPlayed);
        if (canBlockWin || canBlockWin === 0) {
            console.log(`Block Player on cell ${canBlockWin}`);
            return codesTurn(canBlockWin);
        }
        const fork = canFork(forkIndexes.entries(), winningCombos, codePlays, opponentPlays, indexesPlayed);
        if (fork || fork === 0) {
            console.log("Fork on cell " + fork);
            return codesTurn(fork);
        }
        const canBlockFork = blockFork(forkIndexes.entries(), winningCombos, codePlays, opponentPlays, indexesPlayed);
        if (canBlockFork || canBlockFork === 0) {
            console.log("Block fork on " + canBlockFork);
            return codesTurn(canBlockFork);
        }
        const moveToCenter = center(indexesPlayed);
        if (moveToCenter) {
            console.log("Move to center");
            return codesTurn(4);
        }
        const moveToCorner = oppositeCorner(opponentPlays, indexesPlayed);
        if (moveToCorner || moveToCorner === 0) {
            console.log("Move to corner " + moveToCorner);
            return codesTurn(moveToCorner);
        }
        const moveToEmptyCorner = emptyCorner(indexesPlayed);
        if (moveToEmptyCorner || moveToEmptyCorner === 0) {
            console.log("Move to empty corner " + moveToEmptyCorner);
            return codesTurn(moveToEmptyCorner);
        }
        const moveToEmptySide = emptySide(indexesPlayed);
        if (moveToEmptySide || moveToEmptySide === 0) {
            console.log("Move to empty side " + moveToEmptySide);
            return codesTurn(moveToEmptySide);
        }
    }
}
function blockFork(forkIterator, winningComboIterator, codePlays, opponentPlays, indexesPlayed) {
    return canFork(forkIterator, winningComboIterator, opponentPlays, codePlays, indexesPlayed);
}
function canFork(forkIterator, winningComboIterator, codePlays, opponentPlays, indexesPlayed) {
    let combined = [];
    for (let [index, indexes] of forkIterator) {
        if (codePlays.includes(index)) {
            combined.push(...indexes);
        }
    }
    const sortedArray = combined.sort((a, b) => a - b);
    const length = sortedArray.length - 1;
    let possibleForks = [];
    for (let i = 0; i < length; i++) {
        if (sortedArray[i + 1] === sortedArray[i]) {
            possibleForks.push(sortedArray[i]);
        }
    }
    if (possibleForks.length > 0) {
        let possibleWins = [];
        let duplicate = [];
        possibleForks.forEach((forkIndex) => {
            winningComboIterator.forEach((winCombo, index) => {
                if (winCombo.includes(forkIndex)) {
                    if (!duplicate.includes(index)) {
                        possibleWins.push(winCombo);
                        duplicate.push(index);
                    }
                }
            });
        });
        let del = [];
        opponentPlays.forEach((play) => {
            let forkIndex = possibleForks.indexOf(play);
            if (forkIndex > 0)
                possibleForks.splice(forkIndex, 1);
            possibleWins.forEach((winCombo, index) => {
                if (winCombo.includes(play) && !del.includes(index))
                    del.push(index);
            });
        });
        let afterDel = [];
        if (del.length > 0)
            possibleWins.forEach((x, index) => {
                if (!del.includes(index))
                    afterDel.push(x);
            });
        if (possibleForks.length == 0)
            return false;
        let reduced = afterDel.reduce((arr, curr) => arr.concat(curr), []);
        const sorted = reduced.sort((a, b) => a - b);
        const len = sorted.length - 1;
        let duplicatesInReduced = [];
        for (let i = 0; i < len; i++) {
            if (sorted[i + 1] === sorted[i] &&
                !duplicatesInReduced.includes(sorted[i])) {
                duplicatesInReduced.push(sorted[i]);
            }
        }
        let canForkOn = [];
        possibleForks.forEach((x) => {
            if (duplicatesInReduced.includes(x) && !indexesPlayed.includes(x))
                canForkOn.push(x);
        });
        if (canForkOn.length > 0)
            return canForkOn[0];
    }
    return false;
}
function blockWin(iterator, plays, indexesPlayed) {
    return canWin(iterator, plays, indexesPlayed);
}
function canWin(iterator, plays, indexesPlayed) {
    for (let [index, combo] of iterator) {
        let count = 0;
        combo.forEach((x) => {
            if (plays.indexOf(x) > -1) {
                count = count + 1;
            }
        });
        if (count == 2) {
            let moveTo = combo.filter((x) => plays.indexOf(x) < 0)[0];
            if (!indexesPlayed.includes(moveTo))
                return moveTo;
        }
    }
    return false;
}
function emptySide(indexesPlayed) {
    const sides = [1, 3, 5, 7];
    const shuffledArray = shuffle(sides);
    for (let i = 0; i < 4; i++) {
        if (!indexesPlayed.includes(shuffledArray[i]))
            return shuffledArray[i];
    }
    return false;
}
function emptyCorner(indexesPlayed) {
    const corners = [2, 6, 0, 8];
    const shuffledArray = shuffle(corners);
    for (let i = 0; i < 4; i++) {
        if (!indexesPlayed.includes(shuffledArray[i]))
            return shuffledArray[i];
    }
    return false;
}
function oppositeCorner(opponentPlays, indexesPlayed) {
    if (opponentPlays.includes(2) && !indexesPlayed.includes(6))
        return 6;
    else if (opponentPlays.includes(6) && !indexesPlayed.includes(2))
        return 2;
    else if (opponentPlays.includes(0) && !indexesPlayed.includes(8))
        return 8;
    else if (opponentPlays.includes(8) && !indexesPlayed.includes(0))
        return 0;
    else
        return false;
}
function center(indexesPlayed) {
    if (!indexesPlayed.includes(4))
        return true;
    return false;
}
function hasWon(iterator, plays) {
    for (let [index, combo] of iterator) {
        if (combo.every((x) => plays.indexOf(x) > -1)) {
            return true;
        }
    }
    return false;
}
function checkTie(indexesPlayed) {
    if (indexesPlayed.length === 9) {
        return true;
    }
}
function declareWinner(player) {
    const body = document.querySelector("body");
    const cells = document.querySelectorAll(".cell");
    const div = document.querySelector(".board");
    document.getElementById("start").style.visibility = "visible";
    div === null || div === void 0 ? void 0 : div.classList.remove("x", "o");
    cells.forEach((x) => {
        x.removeEventListener("click", clicked);
        x.style.cursor = "default";
    });
    if (player) {
        body.style.backgroundColor = "#d9d9c7";
        playerScore++;
        document.querySelector(".player").innerHTML = `${playerScore}`;
    }
    else {
        body.style.backgroundColor = "#ad756a";
        algoScore++;
        document.querySelector(".algo").innerHTML = `${algoScore}`;
    }
    return setTimeout(() => {
        body.style.backgroundColor = "#40403b";
    }, 1000);
}
function declareTie() {
    const body = document.querySelector("body");
    const drawDiv = document.querySelector(".draw");
    document.getElementById("start").style.visibility = "visible";
    drawScore++;
    drawDiv.innerHTML = `${drawScore}`;
    body.style.backgroundColor = "#58A0AD";
    return setTimeout(() => {
        body.style.backgroundColor = "#40403b";
    }, 1000);
}
function codesTurn(id) {
    const cell = document.getElementById(`${id}`);
    cell.removeEventListener("click", clicked);
    return play(id);
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function switchBoardClass(player) {
    let div = document.querySelector(".board");
    if (player) {
        div.classList.remove("x");
        div.classList.add("o");
        return;
    }
    else {
        div.classList.remove("o");
        div.classList.add("x");
        return;
    }
}
