import "reflect-metadata";
import { container } from "tsyringe";
import { Intents, Interaction, Message } from "discord.js";
import { Client, DIService } from "discordx";
import { dirname, importx } from "@discordx/importer";
import MongoDatabase from "./services/mongoClient.js";
import TaskManager from "./tasks/index.js";
import config from "./config.js";
import discordModals from 'discord-modals'

DIService.container = container;

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

discordModals(client);

client.once("ready", async () => {
  await client.guilds.fetch();

  await client.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });

  await client.initApplicationPermissions(true);
  console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

async function run() {
  await importx(
    dirname(import.meta.url) + "/{events,commands,api}/**/*.{ts,js}"
  );

  if (!config.discord.token) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }
  await client.login(config.discord.token);

}

(new MongoDatabase()).init().then((client) => {
  container.registerInstance("Database", client);
  TaskManager.getInstance().start()
  run();
})