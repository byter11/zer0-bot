const { Client, Intents } = require('discord.js');
const config  = require('../src/config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log(client.guilds.cache)
});

client.login(config.discord.token);