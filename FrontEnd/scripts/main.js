const baseUrl = 'http://localhost:3000';
const imagesUrl = 'http://localhost:3000/images';

class Piece {
    constructor(piece) {
        this.piece = piece;
        this.img = imagesUrl + '/' + piece + '.png';
    }
}

let myModal = new bootstrap.Modal(document.getElementById('teamSelect'));
let whiteBtn = document.getElementById('whiteBtn');
let blackBtn = document.getElementById('blackBtn');
class Board {
    constructor() {
        this.boardElement = document.getElementsByClassName('chess-board')[0];
        this.whiteCellColor = '#f0d9b5';
        this.blackCellColor = '#b58863';
        this.room = null;
        this.playerColor = null;
        this.boardState = {
            board: [],
            turn: null,
            castling: {
                white: {
                    kingSide: false,
                    queenSide: false,
                },
                black: {
                    kingSide: false,
                    queenSide: false,
                }
            },
            enPassant: null,
            halfMoveClock: null,
            fullMoveNumber: null
        };
    }

    convertFENtoBoard(fen, playerColor) {
        let gameState = {
            board: [],
            turn: null,
            castling: {
                white: {
                    kingSide: false,
                    queenSide: false,
                },
                black: {
                    kingSide: false,
                    queenSide: false,
                }
            },
            enPassant: null,
            halfMoveClock: null,
            fullMoveNumber: null
        }

        let board = [];
        let fenArray = fen.split(' ');
        let fenBoard = fenArray[0];
        let fenBoardArray = fenBoard.split('/');
        fenBoardArray.forEach((row) => {
            row.split('').forEach(piece => {
                if (!isNaN(parseInt(piece))) {
                    for (let i = 0; i < piece; i++) {
                        gameState.board.push('');
                    }
                } else {
                    if (piece == piece.toLowerCase()) {
                        gameState.board.push(`b${piece.toLowerCase()}`);
                    } else {
                        gameState.board.push(`w${piece.toLowerCase()}`);
                    }
                }
            });
        });

        fenArray[1] == 'w' ? gameState.turn = 'white' : gameState.turn = 'black';
        fenArray[2].includes('K') ? gameState.castling.white.kingSide = true : gameState.castling.white.kingSide = false;
        fenArray[2].includes('Q') ? gameState.castling.white.queenSide = true : gameState.castling.white.queenSide = false;
        fenArray[2].includes('k') ? gameState.castling.black.kingSide = true : gameState.castling.black.kingSide = false;
        fenArray[2].includes('q') ? gameState.castling.black.queenSide = true : gameState.castling.black.queenSide = false;
        fenArray[3] != '-' ? gameState.enPassant = fenArray[3] : gameState.enPassant = null;
        gameState.halfMoveClock = fenArray[4];
        gameState.fullMoveNumber = fenArray[5];
        console.log(gameState);

        // if playerColor is black, reverse the board
        if (playerColor == 'black') {
            let reversedBoard = [];
            for (let i = 0; i < gameState.board.length; i++) {
                reversedBoard.push(gameState.board[gameState.board.length - 1 - i]);
            }
            gameState.board = reversedBoard;
        }

        return gameState;
    }

    async initBoard(fen) {
        const data = this.convertFENtoBoard(fen, chessBoard.playerColor);
        let whiteCell = document.createElement('div');
        let blackCell = document.createElement('div');
        whiteCell.setAttribute('type', 'cell');
        blackCell.setAttribute('type', 'cell');

        whiteCell.style.width = '100px';
        whiteCell.style.height = '100px';
        whiteCell.style.backgroundColor = this.whiteCellColor;
        whiteCell.style.display = 'inline-block';

        blackCell.style.width = '100px';
        blackCell.style.height = '100px';
        blackCell.style.backgroundColor = this.blackCellColor;
        blackCell.style.display = 'inline-block';

        let pair = false;
        for (let i = 0; i < data.board.length; i++) {
            // if i is divisible by 8, then we need to start a new row
            let cellObject = {
                element: null,
                piece: null,
                position: null,
                reset: function () {
                    this.element = null;
                    this.piece = null;
                    this.position = null;
                }
            };

            if (i % 8 == 0) {
                pair = !pair;
            }
            if (pair) {
                whiteCell.setAttribute('position', i);
                let cell = this.boardElement.appendChild(whiteCell.cloneNode(true));
                cellObject.reset();
                cellObject.element = cell;
                cellObject.piece = data.board[i] != '' ? new Piece(data.board[i]) : null;
                cellObject.position = i;
                this.boardState.board.push(cellObject);
                pair = false;
            } else {
                blackCell.setAttribute('position', i);
                let cell = this.boardElement.appendChild(blackCell.cloneNode(true));
                cellObject.reset();
                cellObject.element = cell;
                cellObject.piece = data.board[i] != '' ? new Piece(data.board[i]) : null;
                cellObject.position = i;
                this.boardState.board.push(cellObject);
                pair = true;
            }
        }
        this.updateBoard(fen);
    }

    async updateBoard(fen) {
        console.log(fen);
        const data = this.convertFENtoBoard(fen);

        this.boardState.castling = data.castling;
        this.boardState.enPassant = data.enPassant;
        this.boardState.halfMoveClock = data.halfMoveClock;
        this.boardState.fullMoveNumber = data.fullMoveNumber;
        this.boardState.turn = data.turn;
        this.boardState.board.forEach(cell => {
            // find the div with position attribute equal to cell.position and empty it
            let div = document.querySelector(`[position="${cell.position}"]`);
            div.innerHTML = '';
            if (cell.piece != null) {
                let piece = document.createElement('div');
                piece.setAttribute('piece', cell.piece.piece);
                let img = document.createElement('img');
                img.src = cell.piece.img;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.cursor = 'pointer';
                piece.appendChild(img);
                // make piece element draggable inside divs with type cell
                if (cell.piece[0] == 'w' && this.playerColor == 'black') {
                    piece.setAttribute('draggable', 'false');
                } else if (cell.piece[0] == 'b' && this.playerColor == 'white') {
                    piece.setAttribute('draggable', 'false');
                } else {
                    piece.setAttribute('draggable', 'true');
                }
                piece.setAttribute('draggable', 'true');
                piece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.clearData();
                    e.dataTransfer.setData('text/plain', cell.piece.piece);
                });
                piece.addEventListener('dragend', (e) => {

                    // get destination element
                    let destination = document.elementFromPoint(e.clientX, e.clientY);
                    checkMove(destination, cell);
                });

                cell.element.appendChild(piece);
            }
            this.boardElement.appendChild(cell.element);
        })

    }

    async initPieces() {
        const data = await this.getBoard();
    }
    async joinRoom() {
        if (localStorage.getItem('token') == null) {
            return;
        }
        let room = document.getElementById('room-id').value;
        let token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/board/room/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passcode: room, token: token }),
        });
        const res = await response.json();

        let socket = new WebSocket(`ws://localhost:3000/ws/${res.id}`);

        socket.onmessage = (event) => {
            console.log('Received message:', event);
            if (typeof event.res != 'undefined') {
                const message = JSON.parse(event.res);
                console.log('Received message:', message);
                if (message.message == 'Valid') {
                    chessBoard.updateBoard(message.board);
                }
                // React to backend changes and update your frontend accordingly
                // Example: Update the DOM, trigger UI changes, etc.
            }

        };

        // Handle errors
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        chessBoard.room = res;

        let parsedToken = JSON.parse(token);

        whiteBtn.disabled = false;
        blackBtn.disabled = false;

        if (res.white_id != null) {
            if (res.white_id != parsedToken.token) {
                whiteBtn.disabled = true;
            }
        } else if (res.black_id != null) {
            if (res.black_id != parsedToken.token) {
                blackBtn.disabled = true;
            }
        };

        if (res.white_id == null || res.black_id == null) {
            if (res.white_id != parsedToken.token && res.black_id != parsedToken.token) {
                myModal.show();
            } else {
                if (res.white_id == null) {
                    whiteBtn.disabled = false;
                    blackBtn.disabled = true;
                } else {
                    whiteBtn.disabled = true;
                    blackBtn.disabled = false;
                }
            }
        }

        myModal.show();

        return res;
    }
}

async function checkMove(destination, cell) {
    if (localStorage.getItem('token') == null) {
        return;
    }
    // check if piece can move to destination
    // if yes, move piece to destination
    // if no, do nothing


    let destinationCell = chessBoard.boardState.board[destination.closest('[type="cell"]').getAttribute('position')];
    let originCell = chessBoard.boardState.board[cell.position];
    console.log(originCell.piece.piece[0], chessBoard.boardState.turn)

    if (chessBoard.boardState.turn == 'white' && originCell.piece.piece[0] == 'b') {
        return;
    }
    if (chessBoard.boardState.turn == 'black' && originCell.piece.piece[0] == 'w') {
        return;
    }

    if (chessBoard.boardState.turn != chessBoard.playerColor) {
        return;
    }

    // check if destination is empty
    if (destinationCell.piece != null) {
        // check if destination is occupied by a piece of the same color
        if (destinationCell.piece.piece[0] == originCell.piece.piece[0]) {
            // do nothing
            return;
        }
        if (destinationCell.piece.piece == 'wk' || destinationCell.piece.piece == 'bk') {
            return;
        }
    }

    // check if piece can move to destination
    const response = await fetch('http://localhost:3000/board/makemove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boardState: chessBoard.boardState, origin: cell.position, destination: destination.getAttribute('position'), room: chessBoard.room }),
    });
    const res = await response.json();
    console.log('res', res);
    if (res.message == 'Valid') {
        if (destination.getAttribute('type') == 'cell') {
            chessBoard.boardState.board[destination.getAttribute('position')].piece = cell.piece;
            chessBoard.boardState.board[cell.position].piece = null;
            chessBoard.boardState.board[destination.getAttribute('position')].piece.position = destination.getAttribute('position');
            // find the div with 
        } else if (destination.closest('[type="cell"]')) {
            chessBoard.boardState.board[destination.closest('[type="cell"]').getAttribute('position')].piece = cell.piece;
            chessBoard.boardState.board[cell.position].piece = null;
            chessBoard.boardState.board[destination.closest('[type="cell"]').getAttribute('position')].piece.position = destination.closest('[type="cell"]').getAttribute('position');

        }

        chessBoard.initBoard(res.board);
    }


}

const chessBoard = new Board();

let button = document.getElementById('create-room-btn');
button.addEventListener('click', async () => {
    await createRoom();
})

async function createRoom() {
    if (localStorage.getItem('token') == null) {
        return;
    }
    let token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/board/room/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token }),
    });
    const res = await response.json();

    document.getElementById('roomId').innerText = res.id;
    document.getElementById('passCode').innerText = res.passkey;


    let socket = new WebSocket(`ws://localhost:3000/ws/${res.id}`);

    socket.onmessage = (event) => {
        console.log('Received message:', event);
        if (typeof event.res != 'undefined') {
            const message = JSON.parse(event.res);

            if (message.message == 'Valid') {
                chessBoard.updateBoard(message.board);
            }
            // React to backend changes and update your frontend accordingly
            // Example: Update the DOM, trigger UI changes, etc.
        }
    }
    // Handle errors
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    chessBoard.room = res;

    let parsedToken = JSON.parse(token);

    whiteBtn.disabled = false;
    blackBtn.disabled = false;

    if (res.white_id != null) {
        if (res.white_id != parsedToken.token) {
            whiteBtn.disabled = true;
        }
    } else if (res.black_id != null) {
        if (res.black_id != parsedToken.token) {
            blackBtn.disabled = true;
        }
    };

    if (res.white_id == null || res.black_id == null) {
        if (res.white_id != parsedToken.token && res.black_id != parsedToken.token) {
            myModal.show();
        } else {
            if (res.white_id == null) {
                whiteBtn.disabled = false;
                blackBtn.disabled = true;
            } else {
                whiteBtn.disabled = true;
                blackBtn.disabled = false;
            }
        }
    }

}

// join room
let joinRoomBtn = document.getElementById('join-room-btn');
joinRoomBtn.addEventListener('click', async () => {
    await chessBoard.joinRoom();
});

let createUsermodal = new bootstrap.Modal(document.getElementById('createUserModal'));

async function createUser(username) {
    // if username is empty, return
    if (username.length < 4) {
        alert('Username must be at least 4 characters long');
        return;
    }

    const response = await fetch('http://localhost:3000/board/createUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username }),
    });

    const res = await response.json();
    createUsermodal.hide();
    localStorage.setItem('token', res.data);
}

// if no localstorage with name token, create user
if (localStorage.getItem('token') == null) {
    createUsermodal.show();
}

let createUserBtn = document.getElementById('createUser');
createUserBtn.addEventListener('click', async () => {
    let userName = document.getElementById('usernameInput').value;
    await createUser(userName);
});


whiteBtn.addEventListener('click', async () => {
    console.log('white');
    let token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/board/roomselectcolor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ room: chessBoard.room, token: token, color: 'white' }),
    });
    const data = await response.json();
    chessBoard.playerColor = 'white';
    myModal.hide();
    console.log('whiteData', data)
    chessBoard.initBoard(data.board);
    return data;
});

blackBtn.addEventListener('click', async () => {
    let token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/board/roomselectcolor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ room: chessBoard.room, token: token, color: 'black' }),
    });
    const data = await response.json();
    chessBoard.playerColor = 'black';
    myModal.hide();
    chessBoard.initBoard(data.board);
    return data;
});

