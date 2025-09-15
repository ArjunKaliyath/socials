const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: {type: Schema.Types.ObjectId , ref: 'User', required: true} //difference between type : Object and type : Schema.Types.ObjectId is that the former is used to store any object and the latter is used to store a reference to another document in the database
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

