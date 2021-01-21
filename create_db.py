import sqlite3
conn = sqlite3.connect('valorant.db')
cur = conn.cursor()

cur.execute('''CREATE TABLE Users ([id] int PRIMARY KEY, [info] string, [lastmatch] string)''')
conn.commit()