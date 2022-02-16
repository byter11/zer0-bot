import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import Database  from './database.service';
import { singleton } from 'tsyringe';
import config from '../config';
import User from '../models/User';

const COLLECTION = 'users';

@singleton()
export default class MongoDatabase implements Database {
    private db: Db | undefined;
    private collections: { users?: Collection } = {}

    constructor() {
        const client = new MongoClient(config.db.url)
        client.connect().then(res => {
            this.db = res.db('BotDB'); 
            this.collections.users = this.db.collection('users');
        })
    }

    init() {
        return MongoClient.connect(config.db.url).then(client => {
            console.log("Connected")
            this.db = client.db('botDB');
            this.collections.users = this.db.collection('users')
            return this;
        })
    }

    addUser(user: User) {
        return this.collections.users?.insertOne(user);
    }

    discordUsers() {
        return this.collections.users?.find({discordId: {$exists: true}}).toArray().then((users)=> users as User[])
    }

    valorantUsers() {
        return this.collections.users?.find({valorant: {$exists: true}}).toArray().then((users)=> users as User[])
    }

    valorantServers(): string[] {
        return []
    }

    upsertUser(user: User) {
        return this.collections.users?.updateOne({ id: user.discordId }, { $set: user })
    }
}