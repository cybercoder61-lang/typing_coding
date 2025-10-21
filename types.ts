export enum TypingStatus {
  Waiting,
  Typing,
  Finished,
}

export type Language = {
  id: string;
  name: string;
};

export type TypingStats = {
  wpm: number;
  accuracy: number;
  time: number;
};

export type TypingSession = {
  id: number;
  language: string;
  wpm: number;
  accuracy: number;
  time: number;
  timestamp: number; // Unix timestamp
};
