import type {CommandInteraction } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Discord, Slash } from "discordx";
import { client } from "../main.js";
import { container } from 'tsyringe';
import Database from "../services/database.service.js";
import User from "../models/User.js";

@Discord()
export abstract class AuthCommand {
	@Slash("auth")
	async auth(
		interaction: CommandInteraction
	){
		const db: Database = container.resolve("Database");

		const users = await db.valorantUsers()

		const usersList = 
		const embed = new MessageEmbed()
		.setTitle("Players")
		.setDescription(

		)
	}
}