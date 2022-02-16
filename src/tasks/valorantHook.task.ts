import type Database from "../services/database.service";
import { inject, injectable } from "tsyringe";
import { Task } from '.';
import User from "../models/User";
import nodeFetch from "node-fetch";
import fetchCookie from 'fetch-cookie';


const fetch = fetchCookie(nodeFetch);

@injectable()
export default class ValorantHook extends Task{
    private headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'PostmanRuntime/7.28.4',
    }
    private authHeader: string = '';
    private region = 'eu';

    constructor(
        @inject("Database") private _db: Database
    ) {
        super();
        this._db.discordUsers()?.then((users: User[]) => console.log(users))
    }
    
    private authCookies() {
        return fetch(
            'https://auth.riotgames.com/api/v1/authorization/',
            {
                method: 'POST',
                headers: this.headers,
                body: `{"client_id":"play-valorant-web-prod","nonce":"1","redirect_uri":"https://playvalorant.com/opt_in","response_type":"token id_token"}`
            }
        )
        .then(res => console.log('cookies: ', res.status))
    }

    private authRequest() {
        return fetch(
            'https://auth.riotgames.com/api/v1/authorization/',
            {
                method: 'PUT',
                headers: this.headers,
                body: `
                {
                    "type": "auth",
                    "username": "ZEROPIKACHUU",
                    "password": "noob4026",
                    "remember": true,
                    "language": "en_US"
                }`
            }
        )
        .then(res => {
            console.log('auth: ', res.status);
            return res.json()
        })
        .then((res: any) => {
            const uri = res.response.parameters.uri as string;
            const values = uri.replace('https://playvalorant.com/opt_in#', '').split('&')
            const accessToken = values.map(val => val.split('=')).filter(([key, val]) => key == 'access_token')[0][1];
            return accessToken;
        })

    }

    private entitlement(token: string) {
        return fetch(
            'https://entitlements.auth.riotgames.com/api/token/v1',
            {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Authorization': `Bearer ${token}`
                },
            }
        ).then(res => {
            console.log('entitlement: ', res.status)
            return token;
        })
    }   

    private playerInfo(token: string) {
        return fetch(
            'https://auth.riotgames.com/userinfo',
            {
                headers: {
                    ...this.headers,
                    'Authorization': `Bearer ${token}`
                }
            }
        ).then(res => {
            console.log('playerInfo: ', res.status)
            return res.json()
        })
        .then((res: any) => {
            return res.sub;
        })
    }

    public run(){
        console.log('running')
        this.authCookies()
        .then(() => this.authRequest())
        .then(token => this.entitlement(token))
        .then(token => this.playerInfo(token))
    }

    public authorize(id: string){
        this.authRequest()
        .then(token => this.entitlement(token))
        .then(token => this.playerInfo(token))
        .then(userId => this._db.upsertUser(
            new User(
                id,
                {
                    id: userId,
                }
            )
        ))
        .then(res => {
            console.log(res)
        })
    }
}