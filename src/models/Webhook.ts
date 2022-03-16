import { ObjectId } from 'mongodb';

export default class Webhook {
    constructor(public id: string, public guildId: string, public url: string) {}
}