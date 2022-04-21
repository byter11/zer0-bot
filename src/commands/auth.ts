import type { CommandInteraction } from "discord.js";
import { Modal, TextInputComponent, showModal } from "discord-modals";
import { Discord, Slash } from "discordx";
import { client } from "../main.js";
import { container } from "tsyringe";
import Database from "../services/database.service.js";
import ValorantAPI from "../services/valorantAPI.js";

// Temporary
// Waiting for discord.js to implement modals
const modal = new Modal()
  .setCustomId("credentials-modal")
  .setTitle("Valorant credentials")
  .addComponents(
    new TextInputComponent()
      .setCustomId("credentials-modal-user")
      .setLabel("username")
      .setStyle("SHORT")
      .setRequired(true),

    new TextInputComponent()
      .setCustomId("credentials-modal-pass")
      .setLabel("password")
      .setStyle("SHORT")
      .setRequired(true)
  );

client.on("modalSubmit", async (modal) => {
  if (modal.customId === "credentials-modal") {
    const username = modal.getTextInputValue('credentials-modal-user');
    const password = modal.getTextInputValue('credentials-modal-pass');
    // const username = modal.components[0].value;
    // const password = modal.components[1].value;
    const db: Database = container.resolve("Database");

    await modal.deferReply({ephermal: true});
    try {
      new ValorantAPI({
        user: username,
        pass: password,
      })
        .connect()
        .then((id) => {
          if (!id) return;
          db.upsertUser({
            discordId: modal.user.id,
            valorant: { id: id },
          })?.then(() => {
            modal.followUp({ content: 'Authorized' })
          });
        });
    } catch (e) {
      modal.followUp({ content: `${e}` });
      console.log(e);
    }
  }
});

@Discord()
export abstract class AuthCommand {
  @Slash("auth")
  auth(interaction: CommandInteraction): void {
    showModal(modal, {
      client: client,
      interaction: interaction,
    });
  }
}

@Discord()
export abstract class UnAuthCommand {
  @Slash("unauth")
  auth(interaction: CommandInteraction): void {
    const db: Database = container.resolve("Database");
    db.removeUser(interaction.user.id)
    .then(() => {
      interaction.reply({
        ephemeral: true,
        content: "Unauthorized"
      });
    })
  }
}
