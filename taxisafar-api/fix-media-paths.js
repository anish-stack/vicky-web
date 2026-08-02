/**
 * One-off repair for image paths that point at files which aren't on disk.
 *
 * Seeded records reference names like `/uploads/packages/mathura-vrindavan-cover.jpg`
 * that were never actually uploaded. This matches each stale path to the real
 * file in the same folder by slug prefix and rewrites it.
 *
 *   node fix-media-paths.js          # report only
 *   node fix-media-paths.js --apply  # write the changes
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB, mongoose } = require("./src/config/db");
const M = require("./src/models");

const APPLY = process.argv.includes("--apply");
const UPLOAD_ROOT = path.join(__dirname, "uploads");

/** Best on-disk match for a stored path, or null. */
function findOnDisk(stored) {
  if (!stored || typeof stored !== "string" || !stored.startsWith("/uploads/")) return null;

  const rel = stored.replace(/^\/uploads\//, "");
  const abs = path.join(UPLOAD_ROOT, rel);
  if (fs.existsSync(abs)) return stored;

  const folder = path.dirname(rel);
  const ext = path.extname(rel);
  const base = path.basename(rel, ext);
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) return null;

  // the uploader keeps the slug and appends a suffix, so prefix-match it
  const candidates = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(base))
    .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  return candidates.length ? `/uploads/${folder}/${candidates[0].f}` : null;
}

/** Walk a document and repair every string field that looks like an upload path. */
function repair(value) {
  let changed = false;

  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      for (const key of Object.keys(node)) node[key] = walk(node[key]);
      return node;
    }
    if (typeof node === "string" && node.startsWith("/uploads/")) {
      const fixed = findOnDisk(node);
      if (fixed && fixed !== node) {
        console.log(`   ${node}\n → ${fixed}`);
        changed = true;
        return fixed;
      }
      if (!fixed) console.log(`   MISSING (no file found): ${node}`);
    }
    return node;
  };

  const next = walk(value);
  return { next, changed };
}

const COLLECTIONS = [
  ["TourPackage", ["coverImage", "gallery", "itinerary", "placesCovered", "vehicleOptions"]],
  ["Hotel", ["image", "gallery"]],
  ["Destination", ["image"]],
  ["Service", ["image", "icon"]],
  ["Testimonial", ["avatar"]],
  ["Vehicle", ["image"]],
  ["DhamPackage", ["image", "gallery"]],
  ["Content", ["sections"]],
];

async function run() {
  await connectDB();
  let total = 0;

  for (const [modelName, fields] of COLLECTIONS) {
    const Model = M[modelName];
    if (!Model) continue;

    const docs = await Model.find().lean();
    for (const doc of docs) {
      let touched = false;
      const update = {};

      for (const field of fields) {
        if (doc[field] === undefined) continue;
        const { next, changed } = repair(doc[field]);
        if (changed) {
          update[field] = next;
          touched = true;
        }
      }

      if (touched) {
        total += 1;
        console.log(`${modelName} ${doc._id} ${doc.title || doc.name || doc.page || ""}`);
        if (APPLY) await Model.updateOne({ _id: doc._id }, { $set: update });
      }
    }
  }

  console.log(
    total === 0
      ? "\nNothing to fix."
      : APPLY
      ? `\n${total} documents updated.`
      : `\n${total} documents would be updated. Re-run with --apply to write.`
  );

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
