import os
import discord
import json
from discord.ext import commands, tasks
from valApi import ValorantAPI
import psycopg2


username = os.getenv('VALO_USERNAME')
password = os.getenv('VALO_PASSWORD')
region = "eu"

db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS') 
conn = psycopg2.connect(host=db_host, user=db_user, password=db_pass, dbname=db_user)

maps = {
  '/Game/Maps/Duality/Duality': 'Bind',
  '/Game/Maps/Bonsai/Bonsai': 'Split',
  '/Game/Maps/Ascent/Ascent': 'Ascent',
  '/Game/Maps/Port/Port': 'Icebox',
  '/Game/Maps/Triad/Triad': 'Haven'
}

class Valorant(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db = conn.cursor()
        self.channels = []
        
        
       
    @commands.Cog.listener()
    async def on_ready(self):
        try:
            f = open(".channel", 'r')
            channels = json.load(f)
            self.channels = [ self.bot.get_channel(id) for id in channels ]
            if self.channels:
                self.send_results.start()
        except Exception as e:
            print(e)

    @commands.command()
    async def say(self,ctx, msg):
        await ctx.send(msg)

    @commands.command(brief = "Setup Valorant on this channel")
    async def valsetup(self,ctx):
        if ctx.message.channel.id in self.channels:
            await ctx.send("Channel already registered.")
            return

        self.channels.append(ctx.message.channel)
        f = open(".channel", 'w')
        ids = [c.id for c in self.channels]
        json.dump(ids , f, indent=2)
        f.close()
        await ctx.send(f'Added {ctx.message.channel} for VALORANT notifications!')
        self.send_results.start()

    def cog_unload(self):
        self.send_results.cancel()

    @tasks.loop(minutes = 5)
    async def send_results(self):
        if not self.channels:
            return
        self.db.execute('''SELECT * FROM Users''')
        users = self.db.fetchall()
        api = ValorantAPI(username, password, region)

        for user in users:
            author = self.bot.get_user(int(user[0]))
            if not author:  author = await self.bot.fetch_user(int(user[0]))
            print(author, end=' ')
            try:
                match = api.get_match_history(user[1], 2)
                match = match["Matches"][1]
            except Exception as e:
                print("\n", e)
                continue
            
            rating_earned = match["RankedRatingEarned"]
            print(rating_earned)
            # print(author, match)
            # if (user[2] == match["MatchID"]):
            #     continue
            #except: continue
            
            if rating_earned == 0: continue

            self.db.execute('''UPDATE Users SET lastmatch=%s WHERE id=%s''', (match["MatchID"], user[0]))
            
            movement = match["CompetitiveMovement"]
            if  movement == "MOVEMENT_UNKNOWN":
                movement = "INCREASE" if rating_earned > 0 else "DECREASE"
            #### EMBED CREATION ####
            

            rank_img = f'./val_assets/{match["TierAfterUpdate"]}.png'
            result = "Loss" if (rating_earned < 0) else "Win"
            
            movement_img = f'https://raw.githubusercontent.com/byter11/moSin-discord-bot/master/val_assets/{movement}.png'
            thumbnail = f'https://raw.githubusercontent.com/byter11/moSin-discord-bot/master/val_assets/ranks/{match["TierAfterUpdate"]}.png'
            # map_img = f'https://raw.githubusercontent.com/byter11/moSin-discord-bot/master/val_assets/maps/{maps[match["MapID"]]}'

            description = "rekt" if result=="Loss" else "gg"
            embed = discord.Embed(title=f'{result} - **{maps[match["MapID"]]}**', description=description)
            

            embed.set_author(name = author.name, icon_url=author.avatar_url)
            embed.set_footer(text = str(rating_earned), icon_url = movement_img)
            embed.set_thumbnail(url = thumbnail)
            for channel in self.channels:
                if await channel.guild.fetch_member(author.id):
                    await channel.send(embed=embed)
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
        
        self.db.execute('''INSERT INTO Users (id, info) VALUES (%s,%s)
                            ON CONFLICT (id) DO
                            UPDATE SET info=%s''', (ctx.message.author.id, info,info))
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
