import config from '../config';
import User from '../models/User';
import Webhook from '../models/Webhook';

export default interface Database {
    addUser(user: User) : Promise<any>
    discordUsers(): Promise<User[] | undefined>
    valorantUsers(): Promise<User[] | undefined>
    valorantServers(): string[]
    upsertUser(user: User): Promise<any>
    webhook(guildId: string): Promise<Webhook | undefined>
    webhooks(): Promise<Webhook[] | undefined>
    registerWebhook(webhook: Webhook): Promise<any>
}
