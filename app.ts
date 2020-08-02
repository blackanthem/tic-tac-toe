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

//TODO: think of a better variable name
const adjacentCells = [
  [
    [1, 2],
    [4, 8],
    [3, 6],
  ],
  [
    [0, 2],
    [4, 7],
  ],
  [
    [0, 1],
    [5, 8],
    [4, 6],
  ],
  [
    [0, 6],
    [4, 5],
  ],
  [
    [1, 7],
    [3, 5],
    [0, 8],
    [2, 6],
  ],
  [
    [2, 8],
    [3, 4],
  ],
  [
    [0, 3],
    [7, 8],
    [4, 2],
  ],
  [
    [1, 4],
    [6, 8],
  ],
  [
    [2, 5],
    [6, 7],
    [0, 4],
  ],
];

const forkIndexes = adjacentCells.map((index) => {
  return index.reduce((acc, curr) => acc.concat(curr), [] as number[]);
});

const corners = [0, 2, 6, 8];

let board: boolean[] = [],
  indexesPlayed: number[] = [],
  player: boolean,
  numberOfPlays: number,
  algorithmScore = 0,
  playerScore = 0,
  drawScore = 0,
  algorithmPlays: number[] = [],
  playerPlays: number[] = [];

const startButton = document.getElementById("start")!;
const cellDivs = document.querySelectorAll(".cell");
const boardDiv = document.querySelector(".board")!;
const body = document.querySelector("body")!;
const drawDiv = document.querySelector(".draw");
const playerDiv = document.querySelector(".player");
const algorithmDiv = document.querySelector(".algo");

const backgroundColor = "#40403b";
const drawColor = "#58A0AD";
const algorithmColor = "#ad756a";
const playerColor = "red";

window.onload = () => {
  start();
};

document.onkeypress = (e) => {
  if (e.code === "Space") start();
};

function start() {
  console.log("START");
  board = [];
  indexesPlayed = [];
  player = Math.random() > 0.5;
  numberOfPlays = 0;
  //   startButton.style.visibility = "hidden";

  cellDivs.forEach((div) => {
    div.addEventListener("click", clicked, { once: true });
    div.classList.remove("x", "o");
    (div as HTMLDivElement).style.cursor = "pointer";
  });

  if (!player) {
    const moveTo = shuffle(corners)[2];
    console.log("Move to " + moveTo);
    return codesTurn(moveTo);
  }
  return;
}

function clicked(e: Event) {
  play(+(e.target as HTMLDivElement).id);
}

function play(id: number) {
  numberOfPlays++;
  indexesPlayed.push(id);
  board[id] = player;

  const element = document.getElementById(`${id}`)!;
  element.style.cursor = "not-allowed";
  player ? element.classList.add("x") : element.classList.add("o");

  const state = board.reduce(
    (acc, value, currIndex) => (value === player ? acc.concat(currIndex) : acc),
    [] as number[]
  );

  if (hasWon(state)) return declareWinner();
  if (checkTie()) return declareTie();
  player = !player;

  if (!player) {
    algorithmPlays = board.reduce(
      (acc, value, currIndex) =>
        value === player ? acc.concat(currIndex) : acc,
      [] as number[]
    );
    playerPlays = board.reduce(
      (acc, value, currIndex) =>
        value === !player ? acc.concat(currIndex) : acc,
      [] as number[]
    );

    if (numberOfPlays === 3) {
      if (
        (playerPlays.includes(2) && playerPlays.includes(6)) ||
        (playerPlays.includes(0) && playerPlays.includes(8))
      ) {
        const side = emptySide();
        console.log("Move to empty side " + side);
        return codesTurn(side as number);
      }
    }
    if (numberOfPlays === 2) {
      if (
        algorithmPlays.every((x) => x % 2 === 0) &&
        playerPlays.includes(4) &&
        Math.random() > 0.85
      ) {
        const corner = oppositeCorner();
        console.log("Move to opposite corner " + corner);
        return codesTurn(corner as number);
      }
    }

    const win = canWin(algorithmPlays);
    if (win || win === 0) {
      console.log("Win on " + win);
      return codesTurn(win as number);
    }

    const blockWin = canBlockWin();
    if (blockWin || blockWin === 0) {
      console.log(`Block on ${blockWin}`);
      return codesTurn(blockWin as number);
    }

    const fork = canFork();
    if (fork || fork === 0) {
      console.log("Fork on cell " + fork);
      return codesTurn(fork as number);
    }

    const blockFork = canBlockFork();
    if (blockFork || blockFork === 0) {
      console.log("Block fork on " + blockFork);
      return codesTurn(blockFork as number);
    }

    const moveToCenter = canCenter();
    if (moveToCenter) {
      console.log("Move to center");
      return codesTurn(4);
    }

    const moveToCorner = oppositeCorner();
    if (moveToCorner || moveToCorner === 0) {
      console.log("Move to corner " + moveToCorner);
      return codesTurn(moveToCorner as number);
    }

    const moveToEmptyCorner = emptyCorner();
    if (moveToEmptyCorner || moveToEmptyCorner === 0) {
      console.log("Move to empty corner " + moveToEmptyCorner);
      return codesTurn(moveToEmptyCorner);
    }

    const moveToEmptySide = emptySide();
    if (moveToEmptySide || moveToEmptySide === 0) {
      console.log("Move to empty side " + moveToEmptySide);
      return codesTurn(moveToEmptySide);
    }
  }
}

function canWin(plays: number[]): number | boolean {
  let iterator = winningCombos.values();
  for (const combo of iterator) {
    let count = 0;
    combo.forEach((x) => {
      if (plays.indexOf(x) > -1) {
        count = count + 1;
      }
    });

    if (count == 2) {
      const moveTo = combo.filter((x) => plays.indexOf(x) < 0)[0];
      if (!indexesPlayed.includes(moveTo)) return moveTo;
    }
  }
  return false;
}

function canBlockWin() {
  return canWin(playerPlays);
}

function canFork() {
  const forkOn = findForks(algorithmPlays, playerPlays);
  return Array.isArray(forkOn) ? forkOn[0] : false;
}

function canBlockFork() {
  const blockForkOn = findForks(playerPlays, algorithmPlays);

  if (Array.isArray(blockForkOn)) {
    if (blockForkOn.length === 1) return blockForkOn[0];

    const iterator = blockForkOn.values();

    for (const forkIndex of iterator) {
      const cells = adjacentCells[forkIndex].values();

      for (const cell of cells) {
        const [first, second] = cell;

        if (
          playerPlays.every((x) => !cell.includes(x)) &&
          (algorithmPlays.includes(first) || algorithmPlays.includes(second))
        )
          return forkIndex;
      }
    }
  }
  return false;
}

function canCenter() {
  if (!indexesPlayed.includes(4)) return true;
  return false;
}

function oppositeCorner() {
  const plays = numberOfPlays == 2 ? algorithmPlays : playerPlays;

  if (plays.includes(2) && !indexesPlayed.includes(6)) return 6;
  else if (plays.includes(6) && !indexesPlayed.includes(2)) return 2;
  else if (plays.includes(0) && !indexesPlayed.includes(8)) return 8;
  else if (plays.includes(8) && !indexesPlayed.includes(0)) return 0;
  else return false;
}

function emptyCorner() {
  const shuffledArray = shuffle(corners).values();
  for (const moveTo of shuffledArray)
    if (!indexesPlayed.includes(moveTo)) return moveTo;

  return false;
}

function emptySide() {
  const sides = [1, 3, 5, 7];
  const shuffledArray = shuffle(sides).values();

  for (const moveTo of shuffledArray)
    if (!indexesPlayed.includes(moveTo)) return moveTo;

  return false;
}

function findForks(findFor: number[], against: number[]) {
  const iterator = forkIndexes.entries();
  const combined: number[] = [];
  for (let [index, indexes] of iterator) {
    if (findFor.includes(index)) {
      combined.push(...indexes);
    }
  }

  const possibleForks = findDuplicates(combined);

  if (possibleForks.length > 0) {
    let possibleWins: number[][] = [];
    let duplicate: number[] = [];

    possibleForks.forEach((forkIndex) => {
      winningCombos.forEach((winCombo, index) => {
        if (winCombo.includes(forkIndex) && !duplicate.includes(index)) {
          possibleWins.push(winCombo);
          duplicate.push(index);
        }
      });
    });

    against.forEach((play) => {
      const forkIndex = possibleForks.indexOf(play);
      if (forkIndex > 0) possibleForks.splice(forkIndex, 1);

      for (let i = possibleWins.length - 1; i >= 0; i--) {
        const winCombo = possibleWins[i];
        if (winCombo.includes(play)) possibleWins.splice(i, 1);
      }
    });

    if (possibleForks.length == 0) return false;

    const flattenedPossiblewins = possibleWins.reduce(
      (arr, value) => arr.concat(value),
      [] as number[]
    );

    const possibleIndexesToForkOn = findDuplicates(flattenedPossiblewins);

    let canForkOn: number[] = [];

    possibleForks.forEach((x) => {
      if (possibleIndexesToForkOn.includes(x) && !indexesPlayed.includes(x))
        canForkOn.push(x);
    });

    if (canForkOn.length > 1) return canForkOn;
  }
  return false;
}

function hasWon(plays: number[]): boolean {
  const iterator = winningCombos.values();

  for (const combo of iterator)
    if (combo.every((x) => plays.indexOf(x) > -1)) return true;

  return false;
}

function checkTie() {
  if (indexesPlayed.length === 9) return true;
}

function declareWinner() {
  // startButton.style.visibility = "visible";
  boardDiv.classList.remove("x", "o");

  cellDivs.forEach((x) => {
    x.removeEventListener("click", clicked);
    (x as HTMLDivElement).style.cursor = "default";
  });

  if (player) {
    body.style.backgroundColor = playerColor;
    playerScore++;
    if (playerDiv) playerDiv.innerHTML = `${playerScore}`;
  } else {
    body.style.backgroundColor = algorithmColor;
    algorithmScore++;
    if (algorithmDiv) algorithmDiv.innerHTML = `${algorithmScore}`;
  }
  return setTimeout(() => {
    body.style.backgroundColor = "#40403b";
  }, 1000);
}

function declareTie() {
  //   startButton.style.visibility = "visible";
  drawScore++;
  if (drawDiv) drawDiv.innerHTML = `${drawScore}`;
  body.style.backgroundColor = drawColor;
  return setTimeout(() => {
    body.style.backgroundColor = backgroundColor;
  }, 1000);
}

function codesTurn(id: number): any {
  document.getElementById(`${id}`)!.removeEventListener("click", clicked);
  return play(id);
}

function shuffle(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function findDuplicates(array: number[]) {
  const sortedArray = array.sort((a, b) => a - b);
  const length = sortedArray.length - 1;
  let duplicates: number[] = [];

  for (let i = 0; i < length; i++) {
    if (
      sortedArray[i + 1] === sortedArray[i] &&
      !duplicates.includes(sortedArray[i])
    )
      duplicates.push(sortedArray[i]);
  }
  return duplicates;
}
