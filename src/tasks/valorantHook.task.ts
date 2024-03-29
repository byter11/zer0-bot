import type Database from "../services/database.service";
import { inject, injectable } from "tsyringe";
import { Task } from "./index.js";
import User from "../models/User.js";
import { MessageEmbed } from "discord.js";
import { client } from "../main.js";
import config from "../config.js";
import ValorantAPI from "../services/valorantAPI.js";
import _agents from "../../val_assets/agents.json";

const agents: Agent = _agents;

const MAPS: { [key: string]: string } = {
  Duality: "Bind",
  Ascent: "Ascent",
  Foxtrot: "Breeze",
  Canyon: "Fracture",
  Triad: "Haven",
  Port: "Icebox",
  Bonsai: "Split",
};
@injectable()
export default class ValorantHook extends Task {
  private _api: ValorantAPI;
  constructor(@inject("Database") private _db: Database) {
    super();
    const { user = "", pass = "" } = config.valorant;
    this._api = new ValorantAPI({ user, pass });
  }

  public async run() {
    const users = (await this._db.valorantUsers()) || [];
    this._api = await this.apiInstance();
    console.log("running valorantHook");
    users.forEach(async (user) => {
      if (!user || !user.valorant) return;

      const matchId = await this.getLastMatchId(user.valorant.id);
      if (!matchId || matchId == user.valorant.lastMatch) return;

      const match: MatchDetails = await this._api.matchDetails(matchId);

      const embed = this.generateEmbed(match, user);
      await this.executeWebhooks(embed, user.discordId);
      // this._db.setLastMatch(user.discordId, matchId)
      this._db.upsertUser({
        ...user,
        valorant: {
          id: user.valorant.id,
          name: match.players?.find((p) => p.subject == user.valorant?.id)
            ?.gameName,
          lastMatch: matchId,
        },
      });
    });
  }

  private generateEmbed(match: MatchDetails | any, user: User) {
    const player: Player = match.players?.find(
      (p: any) => p.subject == user.valorant?.id
    );

    const { matchId, mapId } = match.matchInfo;
    const { competitiveTier, gameName } = player;
    const character = agents[player.characterId];
    const { score, kills, deaths, assists } = player.stats;

    const win = match.teams.filter(
      (team: Team) => team.teamId == player.teamId
    )[0].won;
    const mapCodeName: string = mapId.split("/").pop();

    return new MessageEmbed()
      .setAuthor({ name: gameName, iconURL: character.icon })
      .setTitle(`${win ? "Win" : "Lose"} - ${MAPS[mapCodeName] || mapCodeName}`)
      .setDescription(
        Object.entries({ score, kills, deaths, assists })
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      )
      .setThumbnail(`https://github.com/byter11/zer0-bot/raw/main/val_assets/ranks/${competitiveTier}.png`);
  }

  private async executeWebhooks(embed: MessageEmbed, userId: string) {
    const webhooks = await this._db.webhooks();
    webhooks?.forEach(async ({ id, guildId, url }) => {
      const wh = await client.fetchWebhook(id);
      const guild = client.guilds.cache.get(wh.guildId);
      const member = await guild?.members.fetch(userId);
      if (!member) return;

      await wh.send({
        username: member.nickname || member?.user.username || wh.name,
        avatarURL:
          member?.user.displayAvatarURL({
            dynamic: true,
            size: 2048,
            format: "png",
          }) ||
          member.avatarURL({ dynamic: true, size: 2048, format: "png" }) ||
          wh.avatarURL() ||
          undefined,
        embeds: [embed],
      });
    });
  }

  private async getLastMatchId(userId: string) {
    const api = await this.apiInstance();
    const matches: Match = await api.matchHistory(userId);
    return matches?.History?.[0]?.MatchID;
  }

  private async apiInstance(): Promise<ValorantAPI> {
    if (Date.now() - this._api.AuthTimestamp > 1000 * 60 * 60 * 12) {
      await this._api.connect();
      return this._api;
    }
    return this._api;
  }
}
