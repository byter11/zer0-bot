type Agent = {
  [uuid: string]: {
    name: string;
    icon: string;
  };
};

type Match = {
  Subject: string;
  BeginIndex: number;
  EndIndex: number;
  Total: number;
  History: [
    {
      MatchID: string;
      GameStartTime: number;
      QueueID: "competitive" | "unrated" | any;
    }
  ];
};

type MatchDetails = {
  matchInfo: MatchInfo;
  players: Player[];
  teams: Team[];
};

type MatchInfo = {
  matchId: string;
  mapId: string;
  queueId: "competitive" | "unrated" | any;
  isRanked: boolean;
  seasonId: string;
  completionState: "Completed" | string;
};

type Player = {
  subject: string;
  gameName: string;
  tagLine: string;
  platformInfo: {
    platformType: "PC" | string;
    platformOS: "Windows" | string;
    platformOSVersion: string;
    platformChipset: "Unknown" | string;
  };
  teamId: "Blue" | "Red";
  partyId: string;
  characterId: string;
  stats: PlayerStats;
  roundDamage: Object[];
  competitiveTier: number;
  playerCard: string;
  playerTitle: string;
  accountLevel: number;
  sessionPlaytimeMinutes: number;
  behaviorFactors: {
    afkRounds: number;
    damageParticipationOutgoing: number;
    friendlyFireIncoming: number;
    friendlyFireOutgoing: number;
    stayedInSpawnRounds: number;
  };
};

type PlayerStats = {
  score: number;
  roundsPlayer: number;
  kills: number;
  deaths: number;
  assists: number;
  playtimeMillis: number;
  abilityCasts: Object;
};
type Team = {
  teamId: "Red" | "Blue";
  won: boolean;
  roundsPlayed: number;
  roundsWon: number;
  numPoints: number;
};
// 'matchInfo',
//   'players',
//   'bots',
//   'coaches',
//   'teams',
//   'roundResults',
//   'kills'
