import dotenv from 'dotenv';
dotenv.config();

export default {
    db: {
        url: process.env.MONGO_URI || ''
    },
    discord: {
        clientId: '',
        clientSecret: '',
        token: ''
    }
}