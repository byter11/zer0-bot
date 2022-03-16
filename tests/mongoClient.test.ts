import MongoDatabase from "../src/services/mongoClient";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import config from "./config";

const mongoClient = new MongoClient(config.db.url);
console.log(config);
test("connection", (done) => {
  function callback(data: number) {
    expect(data).toBe(1);
    done();
  }

  mongoClient.connect().then((client) => {
    const db = client.db("botDB");
    client.close();
    callback(1);
  });
});

test("nothing", () => {
  expect(2).toBe(2);
});
