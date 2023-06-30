const board2 = [
    'br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br',
    'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp',
    'wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'
]

function convertFENtoBoard(fen) {
    let board = [];
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    let fenArray = fen.split(' ');
    let fenBoard = fenArray[0];
    let fenBoardArray = fenBoard.split('/');
    fenBoardArray.forEach((row) => {
        row.split('').forEach(piece => {
            if (!isNaN(parseInt(piece))) {
                for (let i = 0; i < piece; i++) {
                    board.push('');
                }
            } else {
                if (piece == piece.toLowerCase()) {
                    board.push(`b${piece.toLowerCase()}`);
                } else {
                    board.push(`w${piece.toLowerCase()}`);
                }
            }
        });

    });
    console.log(board)
    return board;
}

export default convertFENtoBoard;