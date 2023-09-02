const PLAYER_A = "x";
const PLAYER_B = "o";
const CELLS_NUMBER = 9;
const INFINITY = 10000;
class Player {
  #name;
  #symbol;
  #score = 0;
  constructor(name, symbol) {
    this.#name = name;
    this.#symbol = symbol;
  }

  get score() {
    return this.#score;
  }

  get symbol() {
    return this.#symbol;
  }

  get name() {
    return this.#name;
  }

  increaseScore() {
    this.#score++;
  }

  resetScore() {
    this.#score = 0;
  }
}

class GameBoard {
  #board = Array(9).fill(null);
  #cells = [];
  #freeCells = 9;
  #restartButton = document.querySelector("#restart-btn");
  #nextRoundButton = document.getElementById("next-round-btn");
  #title = document.querySelector("#title");
  #playerA = new Player("PLAYER_A", "X");
  #playerB = new Player("PLAYER_B", "O");
  #roundsNumber = 1;
  #gameOver = false;
  #roundOver = false;

  #currentPlayer = this.#playerA;
  constructor() {
    for (let i = 0; i <= 8; i++) {
      this.#cells.push(document.querySelector(`.cell-${i}`));
    }
    this.#addMoveHandlers();
    this.#handleNextRound();
    this.#handleRestart();
    this.#startHandle();
  }

  #handleRestart() {
    this.#restartButton.addEventListener("click", (e) => {
      this.#board = Array(9).fill(null);
      this.#freeCells = 9;
      this.#cells.forEach((cell) => {
        cell.textContent = "";
      });
      this.#title.textContent = "TIC TAC TOE";
      this.#roundsNumber = 1;
      this.#gameOver = false;
      this.#roundOver = false;
      this.#playerA.resetScore();
      this.#playerB.resetScore();
      this.#currentPlayer = this.#playerA;
      this.#showRoundNumber();
      this.#showScores();
      document.querySelector(".start-window").classList.remove("hidden");
    });
  }

  #handleNextRound() {
    this.#nextRoundButton.addEventListener("click", (e) => {
      this.#nextRoundButton.classList.add("hidden");
      this.#board = Array(9).fill(null);
      this.#freeCells = 9;
      this.#cells.forEach((cell) => {
        cell.textContent = "";
      });
      this.#title.textContent = "TIC TAC TOE";
      this.#roundOver = false;
      this.#showRoundNumber();
    });
  }

  #addMoveHandlers() {
    this.#cells.forEach((cell) =>
      cell.addEventListener("click", (e) => {
        if (cell.textContent || this.#gameOver || this.#roundOver) {
          return;
        }
        cell.textContent = this.#currentPlayer.symbol;
        this.#board[cell.dataset.cellNumber] = this.#currentPlayer;
        this.#freeCells--;
        if (this.#isRoundOver(this.#board)) {
          this.#nextRoundButton.classList.remove("hidden");
          this.#roundOver = true;
          this.#roundsNumber++;
          if (this.#isTie()) {
            this.#title.textContent = "TIE";
          } else {
            this.#currentPlayer.increaseScore();
            this.#showScores();
            if (this.#isGameOverSituation()) {
              this.#nextRoundButton.classList.add("hidden");
              this.#title.textContent = `${this.#currentPlayer.name} WON`;
            }
          }
        }
        this.#changePlayer();
      })
    );
  }

  #showRoundNumber() {
    document.getElementById("round-number").textContent = this.#roundsNumber;
  }

  #isGameOverSituation() {
    return (
      this.#roundsNumber >= 3 && this.#playerA.score !== this.#playerB.score
    );
  }

  #showScores() {
    document.getElementById("score-player-a").textContent = this.#playerA.score;
    document.getElementById("score-player-b").textContent = this.#playerB.score;
  }

  #changePlayer() {
    this.#currentPlayer =
      this.#currentPlayer === this.#playerA ? this.#playerB : this.#playerA;
  }

  #isRoundOver(board) {
    return (
      this.#freeCells === 0 ||
      this.#doHave3InColumns(this.#board) ||
      this.#doHave3InRows(this.#board) ||
      this.#doHave3InDiagonals(this.#board)
    );
  }

  #isTie() {
    return this.#freeCells === 0;
  }

  #doHave3InRows(board) {
    for (let i = 0; i <= 6; i += 2) {
      if (board[i] === board[i + 1] && board[i] === board[i + 2]) {
        return board[i];
      }
    }
    return null;
  }

  #doHave3InDiagonals(board) {
    if (board[0] === board[4] && board[0] === board[8]) {
      return board[0];
    }
    if (board[2] === board[4] && board[2] === board[6]) {
      return board[2];
    }
    return null;
  }

  #doHave3InColumns(board) {
    for (let i = 0; i <= 2; i++) {
      if (board[i] === board[i + 3] && board[i] === board[i + 6]) {
        return board[i];
      }
    }
    return null;
  }

  #startHandle() {
    document.querySelector("#start-game-btn").addEventListener("click", (e) => {
      document.querySelector(".start-window").classList.add("hidden");
    });
  }

  #getAvailableCells(board) {
    const availableCells = [];
    for (let i = 0; i < CELLS_NUMBER; i++) {
      if (!board[i]) availableCells.push(i);
    }
    return availableCells;
  }

  #isRoundWinner(board, playerMark) {
    return (
      this.#doHave3InColumns(board) === playerMark ||
      this.#doHave3InRows(board) === playerMark ||
      this.#doHave3InDiagonals(board) === playerMark
    );
  }

  #minimax(currentBoard, currentMark, humanMark, aiMark) {
    const availableCellIndexes = getAvailableCells(currentBoard);
    if (this.#isRoundWinner(currentBoard, aiMark)) {
      return { score: 1 };
    }
    if (this.#isRoundWinner(currentBoard, humanMark)) {
      return { score: -1 };
    }
    if (availableCellIndexes.length === 0) return { score: 0 };

    const allPlayTestsInfo = this.#getAllTestPlayInfoForEmptyCells(
      availableCellIndexes,
      currentBoard,
      currentMark,
      humanMark,
      aiMark
    );

    return this.#findBestTestPlay(
      allPlayTestsInfo,
      currentMark,
      humanMark,
      aiMark
    );
  }
  #getAllTestPlayInfoForEmptyCells(
    availableCellIndexes,
    currentBoard,
    currentMark,
    humanMark,
    aiMark
  ) {
    const allPlayTestsInfo = [];
    for (const availableCellIndex of availableCellIndexes) {
      const currentPlayTextInfo = { index: availableCellIndex };
      currentBoard[availableCellIndex] = currentMark;
      currentPlayTextInfo.score = this.#minimax(
        currentBoard,
        currentMark === humanMark ? aiMark : humanMark,
        humanMark,
        aiMark
      );
      currentBoard[availableCellIndex] = "";
      allPlayTestsInfo.push(currentPlayTextInfo);
    }
    return allPlayTestsInfo;
  }
  #findBestTestPlay(allPlayTestsInfo, currentMark, humanMark, aiMark) {
    let bestTestPlay = null;
    if (currentMark === aiMark) {
      let bestScore = -INFINITY;
      for (const testPlayInfo of allPlayTestsInfo) {
        if (testPlayInfo.score > bestScore) {
          bestScore = testPlayInfo.score;
          bestTestPlay = testPlayInfo;
        }
      }
    }
    if (currentMark === humanMark) {
      let bestScore = INFINITY;
      for (const testPlayInfo of allPlayTestsInfo) {
        if (testPlayInfo.score < bestScore) {
          bestScore = testPlayInfo.score;
          bestTestPlay = testPlayInfo;
        }
      }
    }
    return bestTestPlay;
  }
}

new GameBoard();
