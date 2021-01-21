###### Imports ########
import os
import discord
from discord.ext import commands

###### Declarations ######
bot = commands.Bot(command_prefix='h!')
TOKEN = os.getenv('DISCORD_TOKEN')
initial_extensions = ['cogs.Clips', 'cogs.Translator', 'cogs.Valorant']
    
if __name__ == '__main__':
    for extension in initial_extensions:
        bot.load_extension(extension)
        				  
@bot.event
async def on_ready():
	print("Logged in")
    #Bot Status: ActivityType can be {listening, playing, streaming}
	await bot.change_presence(status=discord.Status.online, activity=discord.Activity(type=discord.ActivityType.listening, name=";help"))

bot.run(TOKEN)