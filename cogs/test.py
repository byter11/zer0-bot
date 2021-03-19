import psycopg2
import sqlite3

conn_s = sqlite3.connect("valorant.db")
cur = conn_s.cursor()
cur.execute("SELECT * FROM Users")
data = cur.fetchall()

hostname = "tai.db.elephantsql.com"
user = "kbymsmfd"
password = "50y-kqf0kuNjHejpDGM44_cC0-p5lf76"

conn = psycopg2.connect(host=hostname, user=user, password=password, dbname=user)
cursor = conn.cursor()
# cursor.execute('''ALTER TABLE Users ALTER COLUMN id TYPE VARCHAR;''')
# cursor.execute('''SELECT * FROM Users''')
# print(cursor.fetchall())
for d in data:
    cursor.execute('''INSERT INTO Users VALUES (%s, %s, %s)''', (d[0], d[1], d[2]))
# cursor.execute('''TRUNCATE USERS''')

conn.commit()