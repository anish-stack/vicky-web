const mongoose = require("mongoose");

// url -> ImgCloud image id map. Needed to delete a file later by its url.
const cloudFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    cloudId: { type: String, required: true },
    folder: { type: String, default: "files" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CloudFile || mongoose.model("CloudFile", cloudFileSchema);
