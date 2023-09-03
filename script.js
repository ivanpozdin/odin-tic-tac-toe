"use strict";
const PLAYER_A = "x";
const PLAYER_B = "o";
const CELLS_NUMBER = 9;
const INFINITY = 400;
const PAUSE_MILLISECONDS_BEFORE_AI_MOVE = 400;

const GAME_MODE = {
  AI_VS_HUMAN: 1,
  AI_VS_AI: 2,
  HUMAN_VS_AI: 3,
  HUMAN_VS_HUMAN: 4,
};

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
  #playerCanMove = true;
  #gameMode = GAME_MODE.PLAYER_VS_PLAYER;
  #nextStartPlayer = this.#playerB;

  #currentPlayer = this.#playerA;
  get #notCurrentPlayer() {
    return this.#getOpponentPlayerTo(this.#currentPlayer);
  }
  constructor() {
    for (let i = 0; i <= 8; i++) {
      this.#cells.push(document.querySelector(`.cell-${i}`));
    }
    this.#addMoveHandlers();
    this.#handleNextRound();
    this.#handleRestart();
    this.#startHandle();
    this.#updateActivePlayerBorder();
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
      this.#nextStartPlayer = this.#playerB;
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
      this.#currentPlayer = this.#nextStartPlayer;
      this.#nextStartPlayer = this.#getOpponentPlayerTo(this.#nextStartPlayer);
      this.#updateActivePlayerBorder();
      console.log(this.#currentPlayer);

      if (
        this.#currentPlayer === this.#playerA &&
        this.#gameMode === GAME_MODE.AI_VS_HUMAN
      ) {
        this.#makeAIMoveAsPlayer(this.#currentPlayer, this.#notCurrentPlayer);
      }
      if (
        this.#currentPlayer === this.#playerB &&
        this.#gameMode === GAME_MODE.HUMAN_VS_AI
      ) {
        this.#makeAIMoveAsPlayer(this.#currentPlayer, this.#notCurrentPlayer);
      }
    });
  }

  #addMoveHandlers() {
    this.#cells.forEach((cell) =>
      cell.addEventListener("click", (e) => {
        if (
          cell.textContent ||
          this.#gameOver ||
          this.#roundOver ||
          !this.#playerCanMove
        ) {
          return;
        }
        this.#makeMoveToCell(cell);
        if (this.#gameMode === GAME_MODE.HUMAN_VS_HUMAN) return;
        this.#makeAIMoveAsPlayer(this.#currentPlayer, this.#notCurrentPlayer);
      })
    );
  }

  #makeMoveToCell(cell) {
    cell.textContent = this.#currentPlayer.symbol;
    this.#board[cell.dataset.cellNumber] = this.#currentPlayer;
    this.#freeCells--;
    if (this.#isRoundOver(this.#board)) {
      this.#processRoundOverSituation();
      return;
    }
    this.#changePlayer();
  }

  #processRoundOverSituation() {
    console.log("hi", this.#gameMode);
    if (this.#isRoundOver(this.#board)) {
      this.#nextRoundButton.classList.remove("hidden");
      this.#roundOver = true;
      if (!this.#isTie()) this.#currentPlayer.increaseScore();
      this.#showScores();
      if (this.#isGameOverSituation()) {
        this.#nextRoundButton.classList.add("hidden");
        this.#title.textContent = this.#isTie()
          ? "TIE"
          : `${this.#currentPlayer.name} WON`;
      }
      this.#roundsNumber++;
    }
  }

  #showRoundNumber() {
    document.getElementById("round-number").textContent = this.#roundsNumber;
  }

  #showScores() {
    document.getElementById("score-player-a").textContent = this.#playerA.score;
    document.getElementById("score-player-b").textContent = this.#playerB.score;
  }

  #isGameOverSituation() {
    return (
      this.#roundsNumber >= 3 && this.#playerA.score !== this.#playerB.score
    );
  }

  #changePlayer() {
    this.#currentPlayer =
      this.#currentPlayer === this.#playerA ? this.#playerB : this.#playerA;

    this.#updateActivePlayerBorder();
  }

  #updateActivePlayerBorder() {
    if (this.#currentPlayer === this.#playerA) {
      document
        .querySelector(".score-player-b-container")
        .classList.remove("active-player");

      document
        .querySelector(".score-player-a-container")
        .classList.add("active-player");
    } else {
      document
        .querySelector(".score-player-a-container")
        .classList.remove("active-player");

      document
        .querySelector(".score-player-b-container")
        .classList.add("active-player");
    }
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
    for (let i = 0; i <= 6; i += 3) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 1] &&
        board[i] === board[i + 2]
      ) {
        return board[i];
      }
    }
    return null;
  }

  #doHave3InDiagonals(board) {
    if (board[0] !== "" && board[0] === board[4] && board[0] === board[8]) {
      return board[0];
    }
    if (board[2] !== "" && board[2] === board[4] && board[2] === board[6]) {
      return board[2];
    }
    return null;
  }

  #doHave3InColumns(board) {
    for (let i = 0; i <= 2; i++) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 3] &&
        board[i] === board[i + 6]
      ) {
        return board[i];
      }
    }
    return null;
  }

  #makeAIMoveAsPlayer(player, opponent) {
    const { index: aiMoveIndex } = this.#minimax(
      this.#board,
      player,
      opponent,
      player
    );
    console.log(aiMoveIndex, "making move...");
    this.#playerCanMove = false;
    setTimeout(() => {
      this.#makeMoveToCell(this.#cells[aiMoveIndex]);
      this.#playerCanMove = true;
    }, PAUSE_MILLISECONDS_BEFORE_AI_MOVE);
  }

  #startHandle() {
    document
      .querySelector(".start-window form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.#setGameMode();
        if (this.#gameMode === GAME_MODE.AI_VS_AI) {
          return alert("One player have to be HUMAN");
        }
        document.querySelector(".start-window").classList.add("hidden");
        this.#updateActivePlayerBorder();
        if (this.#gameMode === GAME_MODE.AI_VS_HUMAN) {
          this.#makeAIMoveAsPlayer(this.#playerA, this.#playerB);
        }
      });
  }

  #setGameMode() {
    const playerA = document.getElementById("player-a-select").value;
    const playerB = document.getElementById("player-b-select").value;

    if (playerA === "ai" && playerB === "human") {
      this.#gameMode = GAME_MODE.AI_VS_HUMAN;
    }
    if (playerA === "ai" && playerB === "ai") {
      this.#gameMode = GAME_MODE.AI_VS_AI;
    }
    if (playerA === "human" && playerB === "ai") {
      this.#gameMode = GAME_MODE.HUMAN_VS_AI;
    }
    if (playerA === "human" && playerB === "human") {
      this.#gameMode = GAME_MODE.HUMAN_VS_HUMAN;
    }
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

  #minimax(currentBoard, currentPlayer, opponent, player) {
    const availableCellIndexes = this.#getAvailableCells(currentBoard);
    if (this.#isRoundWinner(currentBoard, player)) {
      return { score: 1 };
    }
    if (this.#isRoundWinner(currentBoard, opponent)) {
      return { score: -1 };
    }
    if (availableCellIndexes.length === 0) {
      return { score: 0 };
    }

    const allPlayTestsInfo = this.#getAllTestPlayInfoForEmptyCells(
      availableCellIndexes,
      currentBoard,
      currentPlayer,
      opponent,
      player
    );

    return this.#findBestTestPlay(
      allPlayTestsInfo,
      currentPlayer,
      opponent,
      player
    );
  }

  #getAllTestPlayInfoForEmptyCells(
    availableCellIndexes,
    currentBoard,
    currentPlayer,
    opponent,
    player
  ) {
    const allPlayTestsInfo = [];
    for (const availableCellIndex of availableCellIndexes) {
      const currentPlayTextInfo = { index: availableCellIndex };
      currentBoard[availableCellIndex] = currentPlayer;
      currentPlayTextInfo.score = this.#minimax(
        currentBoard,
        currentPlayer === opponent ? player : opponent,
        opponent,
        player
      ).score;
      currentBoard[availableCellIndex] = "";
      allPlayTestsInfo.push(currentPlayTextInfo);
    }
    return allPlayTestsInfo;
  }

  #findBestTestPlay(allPlayTestsInfo, currentPlayer, opponent, player) {
    let bestTestPlay = null;
    if (currentPlayer === player) {
      let bestScore = -INFINITY;
      for (const testPlayInfo of allPlayTestsInfo) {
        if (testPlayInfo.score > bestScore) {
          bestScore = testPlayInfo.score;
          bestTestPlay = testPlayInfo;
        }
      }
    }
    if (currentPlayer === opponent) {
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

  #getOpponentPlayerTo(player) {
    if (player === this.#playerA) {
      return this.#playerB;
    }
    return this.#playerA;
  }
}

new GameBoard();
