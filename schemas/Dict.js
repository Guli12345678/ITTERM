const { Schema, model } = require("mongoose");

const dictSchema = new Schema(
  {
    term: { type: String, required: true, trim: true },
    letter: { type: String, uppercase: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String },
    refresh_token: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("Dictionary", dictSchema);
