import {
  Board,
  ActivePiece,
  PIECES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  isValid,
  lockPiece,
  clearLines,
} from "./engine";

export interface BotTarget {
  rotation: number;
  x: number;
}

function evalBoard(board: Board): number {
  let totalHeight = 0;
  let holes = 0;
  const heights: number[] = [];

  for (let c = 0; c < BOARD_WIDTH; c++) {
    let top = BOARD_HEIGHT;
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      if (board[r][c]) {
        top = r;
        break;
      }
    }
    const h = BOARD_HEIGHT - top;
    heights.push(h);
    totalHeight += h;
    for (let r = top + 1; r < BOARD_HEIGHT; r++) {
      if (!board[r][c]) holes++;
    }
  }

  let bumpiness = 0;
  for (let c = 0; c < BOARD_WIDTH - 1; c++) {
    bumpiness += Math.abs(heights[c] - heights[c + 1]);
  }

  return -0.51 * totalHeight - 0.36 * holes - 0.18 * bumpiness;
}

export function computeBestMove(board: Board, piece: ActivePiece): BotTarget {
  const def = PIECES[piece.type];
  let best = { score: -Infinity, rotation: 0, x: 0 };

  for (let rot = 0; rot < def.shapes.length; rot++) {
    const testPiece: ActivePiece = { ...piece, rotation: rot, y: 0 };

    for (let x = -2; x < BOARD_WIDTH + 2; x++) {
      const p: ActivePiece = { ...testPiece, x };
      if (!isValid(board, p)) continue;

      let y = 0;
      while (isValid(board, { ...p, y: y + 1 })) y++;
      const landed: ActivePiece = { ...p, y };

      const locked = lockPiece(board, landed);
      const { board: cleared, lines } = clearLines(locked);
      const lineBonus = [0, 40, 100, 300, 1200][lines] ?? 0;
      const score = evalBoard(cleared) + lineBonus * 0.5;

      if (score > best.score) {
        best = { score, rotation: rot, x };
      }
    }
  }

  return { rotation: best.rotation, x: best.x };
}
