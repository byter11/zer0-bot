import os
import discord
from discord.ext import commands, tasks
from valApi import ValorantAPI
import sqlite3
conn = sqlite3.connect('valorant.db')

username = os.getenv('VALO_USERNAME')
password = os.getenv('VALO_PASSWORD')
region = "eu"

maps = {
  '/Game/Maps/Duality/Duality': 'bind.jpg',
  '/Game/Maps/Bonsai/Bonsai': 'split.jpg',
  '/Game/Maps/Ascent/Ascent': 'ascent.jpg',
  '/Game/Maps/Port/Port': 'icebox.jpg',
  '/Game/Maps/Triad/Triad': 'haven.jpg',
}

class Valorant(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db = conn.cursor()
        self.api = ValorantAPI(username, password, region)
        self.channel = None
        self.send_results.start()
    
    @commands.Cog.listener()
    async def on_ready(self):
        try:
            f = open(".channel", 'r')
            self.channel = self.bot.get_channel(int(f.read()))
            print (f'Valorant channel: {self.channel.name}')
            f.close()
        except Exception as e:
            print(e)
        
    @commands.command(brief = "Setup Valorant on this channel")
    async def valsetup(self,ctx):
        self.channel = ctx.message.channel
        f = open(".channel", 'w')
        f.write(str(self.channel.id))
        f.close()
        await ctx.send(f'Set {self.channel} for VALORANT notifications!')

    def cog_unload(self):
        self.send_results.cancel()

    @tasks.loop(minutes = 10)
    async def send_results(self):
        if self.channel is None:
            return
        self.db.execute('''SELECT * FROM Users''')
        while ( user := self.db.fetchone() ):
            match = self.api.get_match_history(user[1], 5)["Matches"][1]
            # match = next((x for x in matches["Matches"] if int(x['RankedRatingEarned']) != 0), None)
            author = self.bot.get_user(int(user[0]))
            if not author:  author = await self.bot.fetch_user(int(user[0]))
            # print(author, match)
            # if not match or user[2] == match["MatchID"]:
                # continue
            #except: continue
            rating_earned = match["RankedRatingEarned"]
            print(author, rating_earned)
            if rating_earned == 0: continue

            self.db.execute('''UPDATE Users SET lastmatch=? WHERE id=? ''', (match["MatchID"], user[0]))
            
            movement = match["CompetitiveMovement"]
            if  movement == "MOVEMENT_UNKNOWN":
                movement = "INCREASE" if rating_earned > 0 else "DECREASE"
            #### EMBED CREATION ####
            

            rank_img = f'./val_assets/{match["TierAfterUpdate"]}.png'
            result = "Loss" if (rating_earned < 0) else "Win"
            
            movement_img = f'attachment///val_assets/{movement}.png'
            thumbnail = f'./val_assets/maps/{ maps[ match["MapID"] ] }'
            print(movement_img, thumbnail)

            description = "rekt" if result=="Loss" else "gg"
            embed = discord.Embed(title=result, description=description)
            

            embed.set_author(name = author.name, icon_url=author.avatar_url)
            embed.set_footer(text = str(rating_earned), icon_url = movement_img)
            embed.set_thumbnail(url = thumbnail)
            await self.channel.send(embed=embed)
            break
        conn.commit()
                
        
    @commands.command(brief = "Authorize your account (use DM); format: h!auth USERNAME PASSWORD")
    async def auth(self, ctx, user, pwd):
        if ctx.message.channel.type is not discord.ChannelType.private:
            await ctx.send("Use DMs for this command")
            return
        try:
            authapi = ValorantAPI(user, pwd, 'eu')
            # self.db.set(authapi.get_user_info()[0], None)
        except Exception as m:
            print(m)
            await ctx.send("Invalid credentials")
            return
        info = authapi.get_user_info()
        print("authorizing", info[1])
        info = info[0]
        
        self.db.execute('''INSERT OR IGNORE INTO Users (id, info) VALUES (?,?)''', (ctx.message.author.id, info))
        conn.commit()
        await ctx.send("Authorized successfully!")

    @commands.command(brief = "UnAuthorize user")
    async def unauth(self, ctx, user):
        self.db.execute('''DELETE FROM Users WHERE id=?''', (user,))
        conn.commit()


    @send_results.before_loop
    async def before_results(self):
        print("Cog:Valorant: waiting...")
        await self.bot.wait_until_ready()
def setup(bot):
    bot.add_cog(Valorant(bot))