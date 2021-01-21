import discord
from discord.ext import commands
from xboxapi import Client
import json



class Clips(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.xclient = Client(api_key='2093d32cc36a743f0694f74ddfe96286985afc18')
        self.gamer = self.xclient.gamer('NOOBboss162')

    def getClips(self):
        clips = self.gamer.get('game-clips')
        uris = []
        for clip in clips:
            # clipId = clip['gameClipId']
            uri = clip['gameClipUris'][0]['uri']
            uris.append( uri )
        return uris
    
    @commands.command(brief = "NOObBOSS")
    async def clip(self,ctx, index):
        clips = self.getClips()
        index = int(index)
        if clips[index]:
            await ctx.send(clips[index])
        
def setup(bot):
    bot.add_cog(Clips(bot))