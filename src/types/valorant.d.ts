declare module 'valorant-api';


type Agent = {
	[uuid: string]: {
		name: string,
		icon: string
	}
}

type Match = {
	Subject: string,
	BeginIndex: number,
	EndIndex: number,
	Total: number,
	History: [{
		MatchID: string,
		GameStartTime: number,
		QueueID: 'competetive' | 'unrated' | any
	}]
}
type MatchDetails = {
	matchInfo: {
		matchId: string,
		mapId: string,
		queueId: 'competetive' | 'unrated' | any,
		isRanked: boolean,
		seasonId: string,
		completionState: 'Completed' | string
	},
	players: [
		{
			subject: string,
			gameName: string,
			tagLine: string,
			platformInfo: {
				platformType: 'PC' | string,
				platformOS: 'Windows' | string,
				platformOSVersion: string,
				platformChipset: 'Unknown' | string
			},
			teamId: 'Blue' | 'Red' | string,
			partyId: string,
			characterId: string,
			stats: {
				score: number,
				roundsPlayer: number,
				kills: number,
				deaths: number,
				assists: number,
				playtimeMillis: number,
				abilityCasts: Object
			},
			roundDamage: Object[],
			competitiveTier: number,
			playerCard: string,
			playerTitle: string,
			accountLevel: number,
			sessionPlaytimeMinutes: number,
			behaviorFactors: {
				afkRounds: number,
				damageParticipationOutgoing: number,
				friendlyFireIncoming: number,
				friendlyFireOutgoing: number,
				stayedInSpawnRounds: number
			}
		}
	]
};

// 'matchInfo',
//   'players',
//   'bots',
//   'coaches',
//   'teams',
//   'roundResults',
//   'kills'