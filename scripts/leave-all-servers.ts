import { Client, Intents } from 'discord.js';

const TOKEN = 'NjY1NTIzODc1MTE0OTA5Njk3.Xhm3aA.u4UqAcIO5uYoaGQSpuxyy9k3KYM'
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
	const guilds = await client.guilds.fetch()
	client.guilds.cache.forEach(guild => {
		console.log('Leaving: ', guild.name)
		guild.leave();
	})
});

client.login(TOKEN);