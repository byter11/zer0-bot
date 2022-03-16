import { ObjectId, WithId, Document} from 'mongodb';

export default interface Webhook {
    id: string;
    guildId: string
    url: string,
    _id?: ObjectId
}