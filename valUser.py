import tinydb

db = pickledb.load("./db/valUsers.db", True)

class User():
    def __init__(self, info):
        self.info = info
        self.lastmatch = None
    
    def save(self):
        db.set(self.info, self.lastmatch)


