export interface ArtistType {
  artistId: number;
  artistName: string;
  artworkUrl100: string;
}

export interface ChallengeType {
  id: number;
  attempts: number;
  playerId: number;
  albumName: string;
  artistName: string;
  artworkUrl100: string;
  score: number;
  answered: boolean;
  round: number;
}

export interface User {
  id: number;
  username: string;
  score: number;
}
