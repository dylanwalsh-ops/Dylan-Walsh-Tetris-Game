import { PieceType, PIECES, getColor } from "../game/engine";

const CELL = 18;
const SIZE = 4;

interface Props {
  type: PieceType;
}

export default function NextPiece({ type }: Props) {
  const shape = PIECES[type].shapes[0];
  const color = getColor(type);

  const grid: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const rowOff = Math.floor((SIZE - shape.length) / 2);
  const colOff = Math.floor((SIZE - shape[0].length) / 2);

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && rowOff + r < SIZE && colOff + c < SIZE) {
        grid[rowOff + r][colOff + c] = true;
      }
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`,
        gridTemplateRows: `repeat(${SIZE}, ${CELL}px)`,
        gap: 1,
      }}
    >
      {grid.flat().map((filled, i) => (
        <div
          key={i}
          style={{
            width: CELL,
            height: CELL,
            backgroundColor: filled ? color : "transparent",
            border: filled
              ? `1px solid ${color}cc`
              : "1px solid rgba(255,255,255,0.05)",
            boxShadow: filled ? `0 0 5px ${color}88` : "none",
          }}
        />
      ))}
    </div>
  );
}
