import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import Database  from './database.service.js';
import { singleton } from 'tsyringe';
import config from '../config.js';
import User from '../models/User.js';
import Webhook from '../models/Webhook.js';


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

    async addUser(user: User){
        return this.collections.users?.insertOne(user);
    }

    async discordUsers() {
        return this.collections.users?.find({discordId: {$exists: true}}).toArray().then((users)=> users as User[])
    }

    async valorantUsers() {
        return this.collections.users?.find({valorant: {$exists: true}}).toArray().then((users)=> users as User[])
    }

    valorantServers(): string[] {
        return []
    }

    async upsertUser(user: User) {
        return this.collections.users?.updateOne({ discordId: user.discordId }, { $set: {valorant: user.valorant} }, {upsert: true})
    }

    async setLastMatch(id: string, matchId: string) {
        return this.collections.users?.updateOne({discordId: id}, { $set: {"valorant.lastMatch": matchId} })
    }

    async webhook(guildId: string) {
        return this.collections.webhooks?.findOne({guildId: guildId}).then(webhook => webhook as Webhook)
    }

    async webhooks() {
        return this.collections.webhooks?.find().toArray().then(webhooks => webhooks as Webhook[])
    }

    async registerWebhook(webhook: Webhook) {
        return this.collections.webhooks?.updateOne({guildId: webhook.guildId}, { $set: {id: webhook.id, url: webhook.url} }, {upsert: true})
    }
    
}