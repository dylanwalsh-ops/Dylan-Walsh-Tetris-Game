import { useState } from "react";
import Landing from "./screens/Landing";
import Game from "./screens/Game";

type Screen = "landing" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [roomCode, setRoomCode] = useState("");
  const [gameKey, setGameKey] = useState(0);

  const startGame = (code: string) => {
    setRoomCode(code);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  if (screen === "game") {
    return <Game key={gameKey} roomCode={roomCode} onExit={() => setScreen("landing")} />;
  }

  return <Landing onCreateRoom={startGame} onJoinRoom={startGame} />;
}
