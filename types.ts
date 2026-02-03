
export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  LOST = 'LOST'
}

export interface GameState {
  status: GameStatus;
  timeLeft: number;
  clicks: number;
  highScore: number;
}
