interface PlayerTokens {
  O: "O";
  X: "X";
}

type PlayerToken = "O" | "X";

type Board = { [key: number]: string };

class TicTacToeGame {
  PLAYER_TOKENS: PlayerTokens;
  playerToken: PlayerToken;
  computerToken: PlayerToken;
  gameEnded: boolean;
  MAIN_DIV_ID: string;
  QUESTION_DIV_ID: string;
  $playerScoresContainer: HTMLDivElement;
  $computerScoresContainer: HTMLDivElement;
  $boxesContainer: HTMLDivElement;
  combinations: number[];
  winCombos: Array<number[]>;
  currentBoard: Board;
  isPlayerTurn: boolean;
  constructor() {
    this.PLAYER_TOKENS = {
      O: "O",
      X: "X",
    };
    this.isPlayerTurn = false;
    this.gameEnded = false;
    this.playerToken = this.PLAYER_TOKENS.X;
    this.computerToken = this.PLAYER_TOKENS.O;
    this.MAIN_DIV_ID = "#game-container";
    this.QUESTION_DIV_ID = "start_QS";
    this.$playerScoresContainer = document.getElementById(
      "scores-player",
    ) as HTMLDivElement;
    this.$computerScoresContainer = document.getElementById(
      "scores-computer",
    ) as HTMLDivElement;

    this.$boxesContainer = document.querySelector(".boxes") as HTMLDivElement;
    this.combinations = [];
    this.winCombos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [7, 5, 3],
    ];
    this.currentBoard = {
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
    };
  }
  _doesPlayerStart() {
    return Math.floor(Math.random() * 2 + 1) === 1;
  }
  _toggleTurn() {
    this.isPlayerTurn = !this.isPlayerTurn;
    this._colorizeCurrentPlayer();
  }
  init() {
    const question = `
      <h2 class="question">Would you like to be X or O?</h2>
        <div>
            <button class="btn" id="x-select">X</button> <button class="btn" id='o-select'>O</button>
        </div>
      `;
    const div = document.createElement("div");
    div.id = this.QUESTION_DIV_ID;
    div.style.textAlign = "center";
    div.style.padding = "20px";
    div.innerHTML = question;
    const el = document.querySelector(this.MAIN_DIV_ID) as HTMLDivElement;
    el.appendChild(div);
    const xSelect = document.getElementById("x-select") as HTMLButtonElement;
    const oSelect = document.getElementById("o-select") as HTMLButtonElement;
    xSelect.addEventListener(
      "click",
      this._setToken.bind(this, this.PLAYER_TOKENS.X),
    );
    oSelect.addEventListener(
      "click",
      this._setToken.bind(this, this.PLAYER_TOKENS.O),
    );
  }

  _setToken(token: PlayerToken) {
    if (token === this.PLAYER_TOKENS.X) {
      this.playerToken = this.PLAYER_TOKENS.X;
      this.computerToken = this.PLAYER_TOKENS.O;
    } else {
      this.playerToken = this.PLAYER_TOKENS.O;
      this.computerToken = this.PLAYER_TOKENS.X;
    }
    this.isPlayerTurn = this._doesPlayerStart();
    const questionDiv = document.getElementById(
      this.QUESTION_DIV_ID,
    ) as HTMLDivElement;
    questionDiv.remove();
    this._setCanvas();
    this._startGame();
  }

  _colorizeCurrentPlayer() {
    if (this.isPlayerTurn) {
      this.$playerScoresContainer.style.color = "#12e012";
      this.$computerScoresContainer.style.color = "inherit";
    } else {
      this.$computerScoresContainer.style.color = "#12e012";
      this.$playerScoresContainer.style.color = "inherit";
    }
  }
  _startGame() {
    this._colorizeCurrentPlayer();
    for (let i = 1; i <= 9; i++) {
      const list = document.createElement("li");
      list.className = i.toString();
      list.addEventListener(
        "click",
        this._handleLetterClick.bind(this),
      );
      list.innerHTML = `<i class="letter"><span></span></i>`;
      this.$boxesContainer.append(list);
    }
    setTimeout(() => {
      this.$boxesContainer.style.display = "block";
      this.$boxesContainer.style.position = "absolute";
      if (!this.isPlayerTurn) {
        this._playComputer(1);
      }
    }, 500);
  }

  _displayMessage({
    message,
    timeout = 3000,
    short = false,
  }: { message: string; timeout?: number; short?: boolean }) {
    const messengerEl = document.getElementById("messanger") as HTMLDivElement;
    if (short) {
      messengerEl.classList.add("short-message");
    } else {
      messengerEl.classList.remove("short-message");
    }
    messengerEl.innerText = message;
    messengerEl.style.position = "absolute";
    messengerEl.style.transform = "translateX(0)";
    setTimeout(() => {
      messengerEl.style.position = "relative";
      messengerEl.style.transform = "translateX(-100vw)";
    }, timeout);
  }

  private _handleLetterClick(e: MouseEvent) {
    const target = e.target as HTMLDivElement;
    if (this.isPlayerTurn) {
      this._makeMove(target);
    }
  }
  private _makeMove(target: HTMLDivElement) {
    if (!this.gameEnded && target.innerHTML === "<span></span>") {
      this.combinations.push(+target.parentElement!.className);
      const token = this.getProperToken();
      const currentMove = +target.parentElement!.className;
      this._updateBoard(currentMove, token);
      target.innerHTML = `<span>${token}</span>`;
      const [isWinner] = this.checkWin(token);
      if (isWinner) {
        this._displayMessage(
          { message: this.isPlayerTurn ? "You Win!" : "Computer Wins" },
        );
        this.showWinningCombination();
        this.gameEnded = true;
        this._addScore(this.isPlayerTurn);
        this.reset();
        return;
      }
      if (this.combinations.length === 9) {
        this._displayMessage({ message: "Its a draw" });
        this.reset();
        return;
      }
      this._toggleTurn();
      const move = this._chooseComputerMove(currentMove);
      if (!this.isPlayerTurn) {
        if (typeof move === "number") {
          setTimeout(() => {
            this._playComputer(move);
          }, 500);
        } else {
          console.log("MOVE RETURNED FALSE");
          this._displayMessage({ message: "Its a draw" });
          this.reset();
          return;
        }
      } else {
        setTimeout(() => {
          this._displayMessage(
            { message: "Your Turn", timeout: 500, short: true },
          );
        }, 500);
      }
    }
  }

  private _playComputer(move: number) {
    const target = document.getElementsByClassName(
      move.toString(),
    )[0].firstChild as HTMLDivElement;
    this._makeMove(target);
  }

  private _addScore(toPlayer: boolean) {
    //Add score count to user or computer
    if (toPlayer) {
      //add to player
      const playerScoreEl = document.getElementById(
        "player-score",
      ) as HTMLDivElement;
      playerScoreEl.innerText = +playerScoreEl.innerText + 1 + "";
    } else {
      //add to computer
      const computerScoreEl = document.getElementById(
        "computer-score",
      ) as HTMLDivElement;
      computerScoreEl.innerText = +computerScoreEl.innerText + 1 + "";
    }
  }

  showWinningCombination() {
    let symbol = this.getProperToken();
    let combo = this.checkWin(symbol)[1];
    for (let i = 0; i < combo.length; i++) {
      let currentBox = "." + combo[i];
      // Black box and rotating test for winning combo
      $(currentBox)
        .children("i")
        .addClass("win")
        .children("span")
        .addClass("rotate");
      // const el = document.getElementsByClassName(combo[i])
      // console.log(el)
      // el.children("i").addClass("win").children("span").addClass("rotate")
    }
  }

  reset() {
    this._toggleTurn();
    setTimeout(() => {
      this.$boxesContainer.innerHTML = "";
      this.currentBoard = {
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
        9: "",
      };
      this.combinations = [];
      this.gameEnded = false;

      this._startGame();
    }, 4000);
  }
  checkWin(symbol: PlayerToken): [boolean, number[]] {
    let currentBoard = this.currentBoard;
    let wins = this.winCombos;
    let winningCombo: number[] = [];
    let winner = wins.some(function (combination) {
      let winning = true;
      for (let i = 0; i < combination.length; i++) {
        if (currentBoard[combination[i]] !== symbol) {
          winning = false;
        }
      }
      if (winning) {
        winningCombo = combination;
      }
      return winning;
    });
    return [winner, winningCombo];
  }

  private _setCanvas() {
    var c = document.getElementById("canvas") as HTMLCanvasElement;
    c.style.position = "absolute";
    c.style.opacity = "1";
    var canvas = c.getContext("2d")!;
    canvas.lineWidth = 1;
    canvas.strokeStyle = "#fff";
    //vertical lines
    canvas.beginPath();
    canvas.moveTo(100, 0);
    canvas.lineTo(100, 146.5);
    canvas.closePath();
    canvas.stroke();
    canvas.beginPath();
    canvas.moveTo(200, 0);
    canvas.lineTo(200, 146.5);
    canvas.closePath();
    canvas.stroke();

    // horizontal lines
    canvas.lineWidth = 0.5;

    canvas.beginPath();
    canvas.moveTo(4, 48.5);
    canvas.lineTo(296, 48.5);
    canvas.closePath();
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo(4, 98.5);
    canvas.lineTo(296, 98.5);
    canvas.closePath();
    canvas.stroke();
  }

  getProperToken() {
    return this.isPlayerTurn ? this.playerToken : this.computerToken;
  }
  private _updateBoard(number: number, symbol: PlayerToken) {
    this.currentBoard[number] = symbol;
  }

  /*================================
    Computer Moves
=================================*/

  private _chooseComputerMove(numFilledIn: number) {
    let currentSymbol: PlayerToken = this.computerToken;
    let opponentSymbol = this.playerToken;

    let move: number | boolean =
      this._winChoise(currentSymbol, opponentSymbol)[0];
    if (!move) {
      move = this._winChoise(opponentSymbol, currentSymbol)[0];
    }
    if (!move) {
      move = this._doubleThreatChoice(numFilledIn);
    }
    if (!move) {
      move = this._doubleThreatChoice(numFilledIn);
    }
    if (!move) {
      move = this._firstPlayChoise(numFilledIn);
    }
    if (!move) {
      move = this._playCenter();
    }
    if (!move) {
      move = this._emptyCorner();
    }
    if (!move) {
      move = this._emptySide();
    }
    move = (move && this.currentBoard[move as any]) === "" ? move : false;
    return move;
  }

  private _winChoise(currentSymbol: PlayerToken, opponentSymbol: PlayerToken) {
    const board = this.currentBoard;
    var moves: number[] = [];
    this.winCombos.forEach(function (combo) {
      let notFound = [];
      let notPlayer = true;
      for (var i = 0; i < combo.length; i++) {
        if (board[combo[i]] !== currentSymbol) {
          if (board[combo[i]] === opponentSymbol) {
            notPlayer = false;
          } else {
            notFound.push(combo[i]);
          }
        }
      }
      if (notFound.length === 1 && notPlayer) {
        var move = notFound[0];
        moves.push(move);
      }
    });
    return moves;
  }

  private _doubleThreatChoice(numFilledIn: number) {
    // use winChoice function to test a spot for double threat
    // let board = game.currentBoard;
    let move;

    const currentSymbol = this.getProperToken();
    const opponentSymbol = this.computerToken;
    const board = this.currentBoard;
    // forced diagonal win on 4th move prevention
    if (board[5] === currentSymbol && numFilledIn === 3) {
      if (
        (board[1] === opponentSymbol && board[9] === opponentSymbol) ||
        (board[3] === opponentSymbol && board[7] === opponentSymbol)
      ) {
        // Play an edge to block double threat
        move = this._emptySide();
      }
    }

    if (!move && board[5] === opponentSymbol && numFilledIn === 2) {
      move = this._diagonalSecondAttack();
    }

    if (!move) {
      // clone current board;
      var testBoard = $.extend({}, board);
      for (var i = 1; i <= 9; i++) {
        testBoard = $.extend({}, board);
        if (testBoard[i] === "") {
          testBoard[i] = currentSymbol;
          if (
            this._winChoise(currentSymbol, opponentSymbol).length >= 2
          ) {
            move = i;
          }
        }
      }
    }
    return move || false;
  }

  private _diagonalSecondAttack(
    comp: PlayerToken = game.computerToken,
  ) {
    const corners = [1, 3, 7, 9];
    for (let i = 0; i < corners.length; i++) {
      if (this.currentBoard[corners[i]] === comp) {
        return 10 - corners[i];
      }
    }
  }

  private _firstPlayChoise(
    numFilledIn: number,
  ) {
    const corners = [1, 3, 7, 9];
    let move;
    if (numFilledIn === 1) {
      // player plays center
      if (this.currentBoard[5] === this.playerToken) {
        var cornerNum = Math.floor(Math.random() * 4 + 1);
        move = [1, 3, 7, 9][cornerNum];
      } //player plays corner, play opposite corner
      else {
        for (var i = 0; i < corners.length; i++) {
          if (this.currentBoard[corners[i]] === this.playerToken) {
            move = 5;
          }
        }
      }
    } else if (numFilledIn === 0) {
      var cornerNum = Math.floor(Math.random() * corners.length + 1);
      move = corners[cornerNum];
    }
    return move ? move : false;
  }

  private _playCenter() {
    if (this.currentBoard[5] === "") {
      return 5;
    } else {
      return false;
    }
  }

  private _emptyCorner() {
    var corners = [1, 3, 7, 9];
    var move;
    for (let i = 0; i < corners.length; i++) {
      if (this.currentBoard[corners[i]] === "") {
        move = corners[i];
      }
    }
    return move || false;
  }

  private _emptySide() {
    const sides = [2, 4, 6, 8];
    for (let i = 0; i < sides.length; i++) {
      if (this.currentBoard[sides[i]] === "") {
        return sides[i];
      }
    }
    return false;
  }
}

const game = new TicTacToeGame();

game.init();
