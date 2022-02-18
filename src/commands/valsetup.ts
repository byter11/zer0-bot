import type { Base, CommandInteraction, GuildMember, Role, TextChannel } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { client } from "../main";
import { container } from 'tsyringe';
import Database from "../services/database.service";
import Webhook from "../models/Webhook";


@Discord()
export abstract class ValSetupCommand {
	@Slash("valsetup")
	auth(
		interaction: CommandInteraction
	): void {
        const db : Database = container.resolve('Database');
        db.webhooks()   // Delete existing webhook in guild
        ?.then(hooks => hooks.find(hook => hook.guild == interaction.guildId))
        .then(hook => {
            if(hook)
                return client.fetchWebhook(hook.id)
        })
        .then(webhook => {if(webhook) webhook.delete()})
        .then(() => // Create new webhook and add to db
            (interaction.channel as TextChannel).createWebhook(
                'HenHook'
            )
        )
        .then(webhook => {
            const { id, guildId, url } = webhook;
            db.registerWebhook(
                new Webhook(id, guildId, url)
            );
        })        
	}
}