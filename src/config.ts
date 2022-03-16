import dotenv from "dotenv";
dotenv.config();

export default {
  valorant: {
    user: process.env.VALORANT_USER,
    pass: process.env.VALORANT_PASS,
  },
  db: {
    url: process.env.MONGO_URI || "",
  },
  discord: {
    clientId: "",
    clientSecret: "",
    token: process.env.BOT_TOKEN,
  },
};
