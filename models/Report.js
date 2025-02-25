const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  number: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Report", reportSchema);
