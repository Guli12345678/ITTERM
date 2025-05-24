const { Schema, model } = require("mongoose");

const adminSchema = new Schema({
  name: {
    type: String,
    maxLength: 25,
    minLength: 3,
    required: [true, "Full name is NOT GIVEN "],
  },
  email: {
    type: String,
    required: [true, "email is NOT GIVEN "],
  },
  phone: {
    type: String,
    required: [true, "Phone is NOT GIVEN "],
  },
  password: { type: String },
  is_active: { type: Boolean },
  is_creator: { type: Boolean },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  refresh_token: { type: String },
});

module.exports = model("admin", adminSchema);
