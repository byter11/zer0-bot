import type { CommandInteraction, TextChannel } from "discord.js";
import { Discord, Slash } from "discordx";
import { client } from "../main.js";
import { container } from "tsyringe";
import Database from "../services/database.service.js";

@Discord()
export abstract class ValSetupCommand {
  @Slash("valsetup")
  async auth(interaction: CommandInteraction): Promise<void> {
    const db: Database = container.resolve("Database");
    await interaction.deferReply();
    db.webhooks()
      // Delete existing webhook in guild
      .then((hooks) =>
        hooks?.find((hook) => hook.guildId == interaction.guildId)
      )
      .then((hook) => hook && client.fetchWebhook(hook.id))
      .then((webhook) => webhook?.delete())
      // Create new webhook and add to db
      .then(() => (interaction.channel as TextChannel).createWebhook("Zero"))
      .then(({ id, guildId, url }) =>
        db
          .registerWebhook({ id, guildId, url })
          .then(() => interaction.editReply("Done"))
      );
  }
}
