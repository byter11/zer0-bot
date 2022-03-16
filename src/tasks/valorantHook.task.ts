import type Database from "../services/database.service";
import { inject, injectable } from "tsyringe";
import { Task } from './index.js';
import User from "../models/User.js";
import { GuildScheduledEvent, MessageEmbed } from "discord.js";
import { client } from "../main.js";
import config from "../config.js";
import ValorantAPI from "../services/valorantAPI.js";
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
            teamId: 'Blue',
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
    ],
    teams: [
        {
          teamId: 'Red',
          won: false,
          roundsPlayed: 24,
          roundsWon: 11,
          numPoints: 11
        },
        {
          teamId: 'Blue',
          won: true,
          roundsPlayed: 24,
          roundsWon: 13,
          numPoints: 13
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
        const {user='', pass=''} = config.valorant;
        this._api = new ValorantAPI({ user, pass });
    }

    public async run(){
        const users = await this._db.valorantUsers() || []
        this._api = await this.apiInstance();
        console.log('running valorantHook')
        users.forEach(user => {
            if (user && user.valorant)
                this.getMatch(user.valorant.id)
                .then(match => this.generateEmbed(match, user))
                .then(embed => this.executeWebhooks(embed, user.discordId))
        })
    }

    private async generateEmbed(match: MatchDetails | any, user: User) {
        const player: Player = match.players?.filter((p: any) => p.subject == user.valorant?.id)[0]

        const { matchId, mapId } = match.matchInfo
        const { competitiveTier, gameName }  = player;
        const character = agents[player.characterId]
        const {score, kills, deaths, assists} = player.stats;
        
        const win = match.teams.filter((team: Team) => team.teamId == player.teamId)[0].won;
        
        return new MessageEmbed()
        .setAuthor({name: gameName, iconURL: character.icon})
        .setTitle(`${win ? 'Win' : 'Lose'} - some map`)
        .setDescription(
            Object.entries({score, kills, deaths, assists}).map(([k,v]) => `${k}: ${v}`).join('\n')
        )
    }

    private async executeWebhooks(embed: MessageEmbed, userId: any) {
        const webhooks = await this._db.webhooks();
        webhooks?.forEach(async ({id, guildId, url}) => {
            const wh = await client.fetchWebhook(id);
            const guild = client.guilds.cache.get(wh.guildId)
            const member = await guild?.members.fetch(userId);
            if(!member) return;

            wh.send({
                username: member.user.username, 
                avatarURL: member.user.avatarURL() || wh.avatarURL() || undefined, 
                embeds: [embed]})
        })
    }

    private async getMatch(userId: string) {
        const api = await this.apiInstance();
        const matches : Match = await api.matchHistory(userId);
        return api.matchDetails(matches.History[0].MatchID);
    }

    private async apiInstance()  : Promise<ValorantAPI> {
        if (Date.now() - this._api.AuthTimestamp > 1000 * 60 * 60 * 12){
            await this._api.connect();
            return this._api;
        }
        return this._api;
    }
}