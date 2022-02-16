import type Database from "../services/database.service";
import { inject, injectable } from "tsyringe";
import { Task } from '.';
import User from "../models/User";
import ValorantAPI from "../services/valorantAPI";
import _agents from "../../val_assets/agents.json";

const agents : Agent = _agents;
const testMatch = {
    matchInfo:{
        matchId: 'c0769420-6fc1-49dd-9694-bb3732ede586',
        mapId: '/Game/Maps/Port/Port',    
    },
    players: [
        {
            subject: "c75da912-f7a3-5773-84f8-2a364be99244",
            characterId: "569fdd95-4d10-43ab-ca70-79becc718b46",
            competitiveTier: 9,
            gameName: 'Iron Yeager',
            stats: {
              score: 6736,
              roundsPlayed: 28,
              kills: 24,
              deaths: 16,
              assists: 11,
              playtimeMillis: 2876249,
              abilityCasts: {
                grenadeCasts: 18,
                ability1Casts: 32,
                ability2Casts: 19,
                ultimateCasts: 2
              }
            }
        }
    ]
  }

@injectable()
export default class ValorantHook extends Task{
    private _api : ValorantAPI;
    constructor(
        @inject("Database") private _db: Database
    ) {
        super();
        this._api = new ValorantAPI({
            user: 'ZEROPIKACHUU',
            pass: 'noob4026'
        });
    }

    public async run(){
        const users = await this._db.valorantUsers() || []
        console.log('running valorantHook')
        users.forEach(user => {
            if (user && user.valorant)
                // this.getMatch(user.valorant.id)
                // .then(match => this.generateEmbed(match, user?.valorant?.id))
                // .then(embed => {})
                this.generateEmbed(testMatch, user.valorant.id)
        })
    }

    private async generateEmbed(match: MatchDetails | any, userId : any) {
        const player = match.players?.filter((p: any) => p.subject == userId)[0]

        const { matchId, mapId } = match.matchInfo
        const { competitiveTier, gameName }  = player;
        const stats = {
            ...player.stats,
            character: agents[player.characterId]
        }

        console.log({matchId, mapId, competitiveTier, gameName, stats})
    }

    private async getMatch(userId: string) {
        const api = await this.apiInstance;
        const matches : Match = await api.matchHistory(userId);

        return api.matchDetails(matches.History[0].MatchID);
    }

    private get apiInstance() : Promise<ValorantAPI> {
        if (Date.now() - this._api.AuthTimestamp > 1000 * 60 * 5)
            return this._api.connect().catch(e=>console.log(e)).then(() => this._api)

        return new Promise(() => this._api);
    }
}