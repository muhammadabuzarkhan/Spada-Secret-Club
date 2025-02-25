const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    fullName: String,
    number: String,
    email: String,
    dob: String,
    height: String,
    role: String,
    color: String,
    guiltyMoment: String,
    halfDayGoesTo: String,
    biggestLie: String,
    loveMore: String,
    bestDay: String,
    songListening: String,
    marriageDate: String,
    remindsOf: String,
});

module.exports = mongoose.model('Form', FormSchema);
