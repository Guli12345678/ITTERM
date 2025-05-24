const { Schema, model } = require("mongoose");

const topicSchema = new Schema(
  {
    author_id: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    topic_title: { type: String },
    topic_text: { type: String },
    is_checked: { type: Boolean },
    is_approved: { type: Boolean },
    refresh_token: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model("Topic", topicSchema);
