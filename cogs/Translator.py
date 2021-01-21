import discord
from discord.ext import commands
from translators import get_urdu



class Translator(commands.Cog):
    def init(self, bot):
        self.bot = bot

    @commands.command(brief = "Translate to urdu", name="t")
    async def translate(self, ctx, *args):
        s = ' '.join(args)
        t = get_urdu(s)
        av = ctx.message.author.avatar_url
        embed = discord.Embed(title = t)
        embed.set_author(name = ctx.message.author.name, icon_url=av)
        await ctx.send(embed=embed)
        await ctx.message.delete()

def setup(bot):
    bot.add_cog(Translator(bot))