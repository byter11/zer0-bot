import { ObjectId } from 'mongodb';

export default class Webhook {
    constructor(public id: string, public guild: string, public url: string, public _id?: ObjectId) {}
}