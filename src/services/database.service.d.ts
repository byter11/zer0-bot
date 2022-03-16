
import User from '../models/User.js';

export declare interface Database {
    discordUsers(): Promise<User[]> | undefined
    valorantUsers(): Promise<User[]>
    valorantServers(): string[]
}