const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    image_src: { type: String, default: null },
    token: { type: String },
    init_vector: { type: String },
    face_descriptor: { type: String },
    timestamp: { type: Date, default: new Date() }
})

module.exports = mongoose.model('user', userSchema)