const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: String,
  author: String,
});

module.exports = mongoose.model('Comment', commentSchema);