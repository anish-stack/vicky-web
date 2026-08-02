const path = require("path");
const fs = require("fs/promises");
const { Media } = require("../models");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginate, pageMeta } = require("../utils/response");
const { UPLOAD_ROOT } = require("../middleware/upload");

/**
 * `path` in the database stays relative (`packages/cover-a1b2c3.jpg`) because
 * deletes resolve it against UPLOAD_ROOT.
 *
 * Responses add `publicPath` — the exact, web-ready value to store on a
 * package, hotel or section. Clients must save this verbatim and never build
 * the path themselves: filenames are made unique on write, so any client-side
 * reconstruction drifts from the real file and the image 404s.
 */
const withPublicPath = (doc) => {
  const row = doc.toJSON ? doc.toJSON() : doc;
  return {
    ...row,
    publicPath: `/uploads/${row.path}`,
    url: row.url || `${env.publicBaseUrl}/uploads/${row.path}`,
  };
};

/** POST /api/media/:folder — multipart field name: `files` (up to 10). */
const upload = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.badRequest("No file uploaded");

  const folder = req.params.folder || "general";

  const docs = await Media.insertMany(
    files.map((f) => ({
      url: `${env.publicBaseUrl}/uploads/${folder}/${f.filename}`,
      path: `${folder}/${f.filename}`,
      folder,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      alt: req.body.alt || "",
      uploadedBy: req.user?._id || null,
    }))
  );

  const payload = docs.map(withPublicPath);
  return created(res, payload.length === 1 ? payload[0] : payload, "Uploaded successfully");
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, { limit: 40 });
  const filter = req.query.folder ? { folder: req.query.folder } : {};

  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    Media.countDocuments(filter),
  ]);

  return ok(res, items.map(withPublicPath), "Media fetched successfully", pageMeta(total, page, limit));
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Media.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Media not found");
  await fs.unlink(path.join(UPLOAD_ROOT, doc.path)).catch(() => {});
  return ok(res, null, "Media deleted successfully");
});

module.exports = { upload, list, remove };