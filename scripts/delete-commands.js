import {REST} from '@discordjs/rest'
import config from './src/config';

const rest = new REST({ version: '9' }).setToken(token);


client.once("ready", async () => {
	await client.guilds.fetch();
	rest.get(Routes.applicationCommand(clientId))
  .then(commands => {
    commands.forEach(command => 
      rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id))
      .then(() => console.log(`Deleted command: ${command.name}`))
    )
})
.then(() => console.log("Deleting all commands"))
.catch(error => console.log(error))

});

await client.login(config.discord.token);
