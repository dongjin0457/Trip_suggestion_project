// 테스트 주석 하나더
// 테스트 주정
const grid = document.getElementById("tetris");
const nextBlockGrid = document.getElementById("next-block");
const rows = 20;
const cols = 10;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let isGameOver = false;

// 블럭 모양 정의
const tetrominoes = {
    I: [[1, 1, 1, 1]],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
    ],
    L: [
        [1, 0],
        [1, 0],
        [1, 1],
    ],
    J: [
        [0, 1],
        [0, 1],
        [1, 1],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
    ],
    A: [
        [1, 0],
        [1, 1],
        [0, 1],
    ],
};

const tetrominoKeys = Object.keys(tetrominoes);
let currentTetromino = getRandomTetromino();
let nextTetromino = getRandomTetromino();
let currentRow = 0;
let currentCol = 3;
let dropSpeed = 1000;
let lastMoveTime = Date.now();

// 게임 보드 생성
function createBoard() {
    grid.innerHTML = "";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            grid.appendChild(cell);
        }
    }
}

function createNextBlockDisplay() {
    nextBlockGrid.innerHTML = "";
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            nextBlockGrid.appendChild(cell);
        }
    }
}

createBoard();
createNextBlockDisplay();

// 랜덤 블럭 생성
function getRandomTetromino() {
    const key = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
    return tetrominoes[key];
}

// 블럭 그리기
function drawTetromino(tetromino, row, col, container = grid) {
    tetromino.forEach((r, rowIndex) => {
        r.forEach((cell, colIndex) => {
            if (cell) {
                const gridCell =
                    container.children[
                        (row + rowIndex) * cols + (col + colIndex)
                    ];
                gridCell.classList.add("active");
            }
        });
    });
}

// 블럭 지우기
function clearTetromino(tetromino, row, col, container = grid) {
    tetromino.forEach((r, rowIndex) => {
        r.forEach((cell, colIndex) => {
            if (cell) {
                const gridCell =
                    container.children[
                        (row + rowIndex) * cols + (col + colIndex)
                    ];
                gridCell.classList.remove("active");
            }
        });
    });
}

// 충돌 감지
function checkCollision(tetromino, row, col) {
    for (let r = 0; r < tetromino.length; r++) {
        for (let c = 0; c < tetromino[r].length; c++) {
            if (
                tetromino[r][c] &&
                (row + r >= rows ||
                    col + c < 0 ||
                    col + c >= cols ||
                    board[row + r][col + c])
            ) {
                return true;
            }
        }
    }
    return false;
}

// 블럭 고정
function placeTetromino() {
    currentTetromino.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                board[currentRow + rIdx][currentCol + cIdx] = 1;
            }
        });
    });
    checkLineCompletion();
}

// 한 줄이 완성되면 해당 줄을 삭제하고 위의 블럭을 아래로 내림
function checkLineCompletion() {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every((cell) => cell === 1)) {
            board.splice(r, 1); // 해당 줄 삭제
            board.unshift(Array(cols).fill(0)); // 빈 줄을 맨 위에 추가
            r++; // 줄이 내려왔으므로 다시 확인
        }
    }
}

// 게임 오버 처리: 블럭이 천장에 닿을 경우
function gameOver() {
    isGameOver = true;
    alert("게임 오버!");
}

// 게임 다시 시작
function restartGame() {
    if (isGameOver) {
        board = Array.from({ length: rows }, () => Array(cols).fill(0));
        isGameOver = false;
        currentTetromino = getRandomTetromino();
        nextTetromino = getRandomTetromino();
        currentRow = 0;
        currentCol = 3;
        createBoard();
        createNextBlockDisplay();
        drawNextBlock();
    }
}

// 블럭을 가장 아래로 이동시키기 (더블클릭 시)
function moveToBottom() {
    while (!checkCollision(currentTetromino, currentRow + 1, currentCol)) {
        currentRow++;
    }
    clearTetromino(currentTetromino, currentRow, currentCol); // 최종 위치에 맞게 지우고
    placeTetromino(); // 해당 위치에 고정
    resetBlock(); // 새로운 블럭으로 교체
}

// 블럭 초기화 및 새로운 블럭 생성
function resetBlock() {
    currentTetromino = nextTetromino;
    nextTetromino = getRandomTetromino();
    currentRow = 0;
    currentCol = 3;
    drawNextBlock();
    if (checkCollision(currentTetromino, currentRow, currentCol)) {
        gameOver();
    }
}

// 블럭 회전
function rotate(direction) {
    const rotatedTetromino =
        direction === "left"
            ? rotateTetromino(currentTetromino)
            : rotateTetromino(
                  rotateTetromino(rotateTetromino(currentTetromino))
              ); // 오른쪽 회전은 3번 회전
    clearTetromino(currentTetromino, currentRow, currentCol);
    if (!checkCollision(rotatedTetromino, currentRow, currentCol)) {
        currentTetromino = rotatedTetromino;
    }
    drawTetromino(currentTetromino, currentRow, currentCol);
}

// 블럭 한 칸 아래로 이동
function moveDown() {
    if (isGameOver) return;
    clearTetromino(currentTetromino, currentRow, currentCol);
    currentRow++;
    if (checkCollision(currentTetromino, currentRow, currentCol)) {
        currentRow--;
        placeTetromino(); // 아래로 내려왔을 때 충돌이 있으면 블럭 고정
        resetBlock(); // 새로운 블럭으로 교체
    }
    drawTetromino(currentTetromino, currentRow, currentCol);
}

// 다음 블럭 표시
function drawNextBlock() {
    createNextBlockDisplay();
    const centeredRow = Math.floor((4 - nextTetromino.length) / 2);
    const centeredCol = Math.floor((4 - nextTetromino[0].length) / 2);
    drawTetromino(nextTetromino, centeredRow, centeredCol, nextBlockGrid);
}

// 키보드 입력 처리
let lastKeyTime = 0;
document.addEventListener("keydown", (e) => {
    if (isGameOver && e.code === "Space") {
        restartGame();
    }

    if (!isGameOver) {
        const now = Date.now();
        switch (e.code) {
            case "ArrowLeft":
                clearTetromino(currentTetromino, currentRow, currentCol);
                currentCol--;
                if (checkCollision(currentTetromino, currentRow, currentCol)) {
                    currentCol++;
                }
                drawTetromino(currentTetromino, currentRow, currentCol);
                break;
            case "ArrowRight":
                clearTetromino(currentTetromino, currentRow, currentCol);
                currentCol++;
                if (checkCollision(currentTetromino, currentRow, currentCol)) {
                    currentCol--;
                }
                drawTetromino(currentTetromino, currentRow, currentCol);
                break;
            case "ArrowDown":
                if (now - lastKeyTime < 300) {
                    moveToBottom(); // 더블 클릭
                } else {
                    moveDown(); // 한 칸 아래로
                }
                lastKeyTime = now;
                break;
            case "ArrowUp":
                rotate("right");
                break;
        }
    }
});

// 게임 루프
setInterval(moveDown, dropSpeed);
