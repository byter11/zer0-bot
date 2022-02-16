import { UpdateResult } from 'mongodb';
import config from '../config';
import User from '../models/User';


export default interface Database {
    discordUsers(): Promise<User[]> | undefined
    valorantUsers(): Promise<User[]> | undefined
    valorantServers(): string[]
    upsertUser(user: User): Promise<UpdateResult> | undefined
}
