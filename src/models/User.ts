import { WithId, Document, ObjectId } from "mongodb";
export default interface User {
  discordId: string;
  valorant?: {
    id: string;
    name?: string;
    lastMatch?: string;
  };
  _id?: ObjectId;
}

// const UserSchema = new Schema({
//     discordId: {type: String},
//     valorant: {
//         type: {
//             id: {type: String},
//             lastMatch: {type: String, required: false},
//         },
//         required: false
//     }
// })
// // export default class User {
//     // constructor(public discordId: string, public valorant?: {id: string, lastMatch?: string}, _id?: ObjectId) {}
// // }
// export default mongoose.model('User', UserSchema);
