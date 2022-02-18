import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import Database  from './database.service';
import { singleton } from 'tsyringe';
import config from '../config';
import User from '../models/User';
import Webhook from '../models/Webhook';


@singleton()
export default class MongoDatabase implements Database {
    private db: Db | undefined;
    private collections: { users?: Collection, webhooks?: Collection} = {}

    constructor() { }

    async init() {
        return MongoClient.connect(config.db.url).then(client => {
            console.log("Connected")
            this.db = client.db('botDB');
            this.collections.users = this.db.collection('users')
            this.collections.webhooks = this.db.collection('webhooks')
            return this;
        })
    }

    addUser(user: User){
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
        return this.collections.users?.updateOne({ id: user.discordId }, { $set: user }, {upsert: true})
    }

    setLastMatch(id: string, matchId: string) {
        return this.collections.users?.updateOne({id: id}, { $set: {"valorant.lastMatch": matchId} })
    }

    webhooks() {
        return this.collections.webhooks?.find().toArray().then(webhooks => webhooks as Webhook[])
    }

    registerWebhook(webhook: Webhook) {
        return this.collections.webhooks?.updateOne({guild: webhook.guild}, { $set: webhook }, {upsert: true})
    }

}