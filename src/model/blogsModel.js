const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ALTEF4USER",
      required: true,
    },
    image :{type :String},
    tags: [{ type: String, trim: true }],
    saves: {
      type: Number,
      default: 0,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "ALTEF4USER" }],
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const blogModel = mongoose.model("ALTEF4BLOG", blogSchema);

module.exports = blogModel;
