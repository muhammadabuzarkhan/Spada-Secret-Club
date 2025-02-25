const mongoose = require("mongoose");

const B2b = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
 
  subject: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Contact", B2b);
