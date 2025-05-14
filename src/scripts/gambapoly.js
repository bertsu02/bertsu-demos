import playerImg from '../img/123.png';
import logoPath from '../img/gambapoly.png';
 const totalTiles = 40;
  let position = 0;
  let balance = 0;
  const winAmount = 50;
  const tileMap = [];
  const tileTypes = Array(totalTiles).fill("neutral");
  const prizeValues = {};
  const eventTiles = new Set();
  const bankruptSet = new Set();

  const board = document.getElementById("board");
  const diceDisplay = document.getElementById("dice");

  for (let i = 0; i < 11; i++) tileMap.push({ row: 0, col: i });
  for (let i = 1; i < 10; i++) tileMap.push({ row: i, col: 10 });
  for (let i = 10; i >= 0; i--) tileMap.push({ row: 10, col: i });
  for (let i = 9; i > 0; i--) tileMap.push({ row: i, col: 0 });

  while (bankruptSet.size < 5) {
    const rand = Math.floor(Math.random() * totalTiles);
    if (rand !== 0) bankruptSet.add(rand);
  }

  while (eventTiles.size < 10) {
    const rand = Math.floor(Math.random() * totalTiles);
    if (!bankruptSet.has(rand) && rand !== 0) {
      eventTiles.add(rand);
    }
  }

  for (let i = 0; i < totalTiles; i++) {
    if (i === 0) {
      tileTypes[i] = "start";
    } else if (eventTiles.has(i)) {
      tileTypes[i] = "event";
    } else if (bankruptSet.has(i)) {
      tileTypes[i] = "bankrupt";
    } else {
      tileTypes[i] = "prize";
      prizeValues[i] = Math.floor(Math.random() * 5) + 1;
    }
  }

  const eventDescriptions = {
    1: "You feel degen and you deposited.",
    2: "You won a tip!",
    3: "You invested in memecoin and lost it.",
    4: "You joined a free and won!",
    5: "You joined a free and lost.",
    6: "Gas fees ate your wallet.",
    7: "You ran your daily up",
    8: "You were too slow to join the free",
    9: "Monthly Out!",
    10: "IRS found your wallet.",
  };

  function triggerEvent() {
    const eventId = Math.floor(Math.random() * 10) + 1;
    let message = eventDescriptions[eventId];

    switch (eventId) {
      case 1:
        const factor = Math.random() < 0.5 ? 0.5 : 1.5;
        balance = Math.floor(balance * factor);
        message += ` Your balance is now ${factor}x!`;
        break;
      case 2:
      case 4:
        balance += 5;
        message += " +$5 ";
        break;
      case 3:
      case 6:
        balance = Math.max(0, balance - 5);
        message += " -$5 ";
        break;
      case 7:
        balance += 7;
        message += " You gained $5!";
        break;
      case 9:
        balance += 5;
        message += " You gained $5!";
        break;
      case 10:
        balance = Math.floor(balance / 2);
        message += " You lost half your balance!";
        break;
      default:
        message += " Nothing happened.";
    }

    document.getElementById("eventDescription").textContent = message;
    document.getElementById("eventPopup").style.display = "block";
    updateStatus(message);
  }

  function closeEventPopup() {
    document.getElementById("eventPopup").style.display = "none";
    drawBoard();
  }

  function updateStatus(msg) {
    document.getElementById("status").textContent = `${msg} Balance: $${balance}`;
  }

  function drawBoard() {
    board.innerHTML = "";

    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const cell = document.createElement("div");
        cell.className = "tile";

        const tileIndex = tileMap.findIndex(t => t.row === r && t.col === c);
        if (tileIndex !== -1) {
          const type = tileTypes[tileIndex];
          cell.classList.add(type);

          if (type === "bankrupt") cell.textContent = "💣";
          else if (type === "prize") cell.textContent = `$${prizeValues[tileIndex]}`;
          else if (type === "event") cell.textContent = "❓";
          else if (type === "start") cell.textContent = "Start";

let previousPosition = position - 1;
if (previousPosition < 0) previousPosition = totalTiles - 1;

// Get previous and current tile positions
const from = tileMap[previousPosition];
const to = tileMap[position];

let angle = 0;
if (to.row < from.row) angle = -90;       // up
else if (to.row > from.row) angle = 90;   // down
else if (to.col > from.col) angle = 0;    // right
else if (to.col < from.col) angle = 180;  // left

// Apply player image with rotation
if (tileIndex === position) {
  const player = document.createElement("div");
  player.className = "player";
  const img = document.createElement("img");
  img.src = playerImg;
  img.alt = "Player";
  img.style.transform = `rotate(${angle}deg)`; // 👈 Set rotation
  player.appendChild(img);
  cell.appendChild(player);
}

        } else if (r === 5 && c === 5) {
            cell.classList.add("logo1");
            const logoImg = document.createElement("img");
            logoImg.src = logoPath; 
            logoImg.alt = "Logo";
            logoImg.style.maxWidth = "100%";
            logoImg.style.maxHeight = "100%";
            cell.appendChild(logoImg);

        } else {
          cell.classList.add("hidden");
        }

        board.appendChild(cell);
      }
    }
  }

  function animateDice(callback) {
    let count = 0;
    const interval = setInterval(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      diceDisplay.textContent = ["🎲", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][roll];
      diceDisplay.style.transform = `rotate(${Math.random() * 360}deg)`;
      count++;
      if (count >= 10) {
        clearInterval(interval);
        callback(roll);
      }
    }, 80);
  }

  function movePlayer(steps, callback) {
    let moves = 0;
    const interval = setInterval(() => {
      position = (position + 1) % totalTiles;
      drawBoard();
      moves++;
      if (moves >= steps) {
        clearInterval(interval);
        callback();
      }
    }, 300);
  }

  function rollDice() {
    if (balance >= winAmount) return;

    animateDice(roll => {
      movePlayer(roll, () => {
        let message = `You rolled a ${roll}. `;

        if (eventTiles.has(position)) {
          triggerEvent();
        } else {
          const tileType = tileTypes[position];
          if (tileType === "bankrupt") {
            message += "Bankrupt tile! 💥 Game Over.";
            document.querySelector("button").disabled = true;
          } else if (tileType === "prize") {
            const prize = prizeValues[position];
            balance += prize;
            message += `You won $${prize}.`;
            if (balance >= winAmount) {
              message += " 🎉 You win!";
              document.querySelector("button").disabled = true;
            }
          }
          updateStatus(message);
        }

        drawBoard();
      });
    });
  }

  function resetGame() {
  position = 0;
  balance = 0;
  document.querySelector("button").disabled = false;
  updateStatus("Game reset. Balance: $0");


  bankruptSet.clear();
  eventTiles.clear();

  while (bankruptSet.size < 5) {
    const rand = Math.floor(Math.random() * totalTiles);
    if (rand !== 0) bankruptSet.add(rand);
  }

  while (eventTiles.size < 10) {
    const rand = Math.floor(Math.random() * totalTiles);
    if (!bankruptSet.has(rand) && rand !== 0) {
      eventTiles.add(rand);
    }
  }

  for (let i = 0; i < totalTiles; i++) {
    if (i === 0) {
      tileTypes[i] = "start";
    } else if (eventTiles.has(i)) {
      tileTypes[i] = "event";
    } else if (bankruptSet.has(i)) {
      tileTypes[i] = "bankrupt";
    } else {
      tileTypes[i] = "prize";
      prizeValues[i] = Math.floor(Math.random() * 5) + 1;
    }
  }

  drawBoard();
}

  drawBoard();

window.rollDice = rollDice;
window.resetGame = resetGame;
window.closeEventPopup = closeEventPopup;
