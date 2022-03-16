import config from '../config.js';
import User from '../models/User.js';
import Webhook from '../models/Webhook.js';

export default interface Database {
    addUser(user: User) : Promise<any>
    discordUsers(): Promise<User[] | undefined>
    valorantUsers(): Promise<User[] | undefined>
    valorantServers(): string[]
    upsertUser(user: User): Promise<any>
    setLastMatch(id: string, matchId: string): Promise<any>
    webhook(guildId: string): Promise<Webhook | undefined>
    webhooks(): Promise<Webhook[] | undefined>
    registerWebhook(webhook: Webhook): Promise<any>
}
