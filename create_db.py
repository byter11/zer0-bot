import pycopg2
db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS') 
conn = psycopg2.connect(host=db_host, user=db_user, password=db_pass, dbname=db_user)

cur = conn.cursor()

cur.execute('''CREATE TABLE Users (id varchar PRIMARY KEY, info varchar, lastmatch varchar)''')
conn.commit()