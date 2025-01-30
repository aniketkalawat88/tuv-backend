const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: String, required: true }
});

module.exports = mongoose.model("Blog", BlogSchema);
