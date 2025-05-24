const { Schema, model } = require("mongoose");

const clientSchema = new Schema({
  full_name: {
    type: String,
    maxLength: 25,
    minLength: 3,
    required: [true, "Full name is NOT GIVEN "],
  },
  age: { type: Number, required: [true, "Age is NOT GIVEN"] },
  email: {
    type: String,
    required: [true, "email is NOT GIVEN "],
  },
  password: { type: String },
  phone: {
    type: String,
    required: [true, "Phone is NOT GIVEN "],
  },
  is_active: { type: Boolean },
  refresh_token: String,
});

module.exports = model("client", clientSchema);
