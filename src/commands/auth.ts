import type { Base, CommandInteraction, GuildMember, Role } from "discord.js";
import { Modal, TextInputComponent, showModal } from 'discord-modals';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { client } from "../main";
import { container } from 'tsyringe';
import Database from "../services/database.service";
import User from "../models/User";
import ValorantAPI from "../services/valorantAPI";

// Temporary
// Waiting for discord.js to implement modals
const modal = new Modal()
.setCustomId('credentials-modal')
.setTitle('Valorant credentials')
.addComponents(
	new TextInputComponent()
	.setCustomId('credentials-modal-user')
	.setLabel('username')
	.setStyle('SHORT')
	.setRequired(true),
	
	new TextInputComponent()
	.setCustomId('credentials-modal-pass')
	.setLabel('password')
	.setStyle('SHORT')
	.setRequired(true),
);

client.on('modalSubmit', (modal) => {
	if(modal.customId === 'credentials-modal'){
		const username = modal.fields[0].value;
		const password = modal.fields[1].value;
		const db: Database = container.resolve("Database");

		try{
			(new ValorantAPI({
				user: username,
				pass: password
			})).connect()
			.then(id => {
				db.upsertUser(
					new User(modal.user.id, {id: id})
				)?.then(() => {
				})
			})
		}
		catch(e) {
			console.log(e);
		}
		
	}
})


@Discord()
export abstract class AuthCommand {
	@Slash("auth")
	auth(
		interaction: CommandInteraction
	): void {
		showModal(modal, {
			client: client,
			interaction: interaction
		})
	}
}