import { ObjectId } from 'mongodb';

export default class User {
    constructor(public discordId: string, public valorant?: {id: string, lastMatch?: string}, public _id?: ObjectId) {}
}