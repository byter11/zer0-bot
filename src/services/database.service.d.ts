
import User from '../models/User';

export declare interface Database {
    discordUsers(): Promise<User[]> | undefined
    valorantUsers(): Promise<User[]>
    valorantServers(): string[]
}