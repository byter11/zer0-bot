import type { CommandInteraction } from "discord.js";
import { MessageEmbed } from "discord.js";
import { MembershipStates } from "discord.js/typings/enums";
import { Discord, Slash } from "discordx";
import { container } from "tsyringe";
import Database from "../services/database.service.js";

@Discord()
export abstract class AuthCommand {
  @Slash("players")
  async players(interaction: CommandInteraction) {
    await interaction.deferReply();
    const db: Database = container.resolve("Database");
    const users = await db.valorantUsers();
    // let usersList = '';

    // const emojis = await interaction.guild?.emojis.fetch();

    // for(let {discordId} of users || []) {
    // 	const emoji = emojis?.random();
    // 	const member = await interaction.guild?.members.fetch(discordId);
    // 	if(!member || !member.user) continue;
    // 	usersList += `${emoji && `<:${emoji.name}:${emoji.id}>`} <@${member.user.id}> \n`
    // }

    const embed = new MessageEmbed().setTitle("Players");

    for (let { discordId, valorant } of users || []) {
      const member = await interaction.guild?.members.fetch(discordId);
      if (!member || !member.user) continue;

      const fields = [
        { name: "Discord", value: `<@${member.id}>`, inline: true },
      ];
      if (valorant && valorant.name)
        fields.push({ name: "Valorant", value: valorant.name, inline: true });

      embed.addField(
        valorant?.name || member.user?.username || member.nickname || "Player",
        `<@${member.id}>`
      );
    }

    interaction.editReply({ embeds: [embed] });
  }
}
