const PLAYER_A = "x";
const PLAYER_B = "o";

class GameBoard {
  #board = Array(9).fill(null);
  #cells = [];
  #freeCells = 9;
  #restartButton = document.querySelector("#restart-btn");
  #title = document.querySelector("#title");

  #currentPlayer = PLAYER_A;
  constructor() {
    for (let i = 0; i <= 8; i++) {
      this.#cells.push(document.querySelector(`.cell-${i}`));
    }
    this.#addMoveHandlers();
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
      this.#currentPlayer = PLAYER_A;
    });
  }

  #addMoveHandlers() {
    this.#cells.forEach((cell) =>
      cell.addEventListener("click", (e) => {
        if (cell.textContent) {
          return;
        }
        cell.textContent = this.#currentPlayer;
        this.#board[cell.dataset.cellNumber] = this.#currentPlayer;
        this.#freeCells--;
        if (this.#isGameOver(this.#board)) {
          if (this.#isTie()) {
            this.#title.textContent = "TIE";
          } else {
            if (this.#currentPlayer === PLAYER_A) {
              this.#title.textContent = `Player A WON`;
            } else {
              this.#title.textContent = `Player B WON`;
            }
          }
          // this.#title.textContent = "GAME OVER";
        }

        this.#changePlayer();
      })
    );
  }
  #changePlayer() {
    this.#currentPlayer =
      this.#currentPlayer === PLAYER_A ? PLAYER_B : PLAYER_A;
  }

  #isGameOver(board) {
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
}

new GameBoard();
