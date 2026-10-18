"use strict";
/**
 * One-time migration: local /uploads files -> ImgCloud, DB urls rewritten.
 *
 * Run from project root:
 *   node scripts/migrateToImgCloud.js --dry-run        # report only, no upload / no DB write
 *   node scripts/migrateToImgCloud.js                  # real run
 *   node scripts/migrateToImgCloud.js --concurrency=5
 *   node scripts/migrateToImgCloud.js --delete-local   # remove local file after DB updated
 *
 * Needs .env: MONGO_URI, IMGCLOUD_BASE_URL, IMGCLOUD_API_KEY
 * Optional : UPLOADS_DIR (default ./uploads), MIGRATE_HOSTS (comma list of hosts to treat as "ours")
 *
 * Safe to re-run: only strings containing "/uploads/" are touched,
 * already migrated docs have ImgCloud urls and are skipped.
 */

require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const DELETE_LOCAL = args.includes("--delete-local");
const CONCURRENCY = Number((args.find((a) => a.startsWith("--concurrency=")) || "").split("=")[1]) || 3;

const ROOT = path.resolve(__dirname, "..");
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || path.join(ROOT, "uploads"));

const OUR_HOSTS = new Set(
  [
    "partners.taxisafar.com",
    ...(process.env.MIGRATE_HOSTS || "").split(","),
    ...[process.env.BASE_URL, process.env.FILE_BASE_URL].map((u) => {
      try { return u ? new URL(u).host : ""; } catch (_) { return ""; }
    }),
  ]
    .map((h) => h.trim())
    .filter(Boolean)
);

const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg",
};

const stats = { docs: 0, docsUpdated: 0, refs: 0, uploaded: 0, reused: 0, missing: 0, failed: 0 };
const failures = [];

/* ------------------------------------------------------------
   value -> local file info (or null if not a local upload ref)
------------------------------------------------------------ */
function parseLocalRef(value) {
  if (typeof value !== "string" || !value.includes("/uploads/")) return null;

  let pathname;
  if (/^https?:\/\//i.test(value)) {
    let u;
    try { u = new URL(value); } catch (_) { return null; }
    if (!OUR_HOSTS.has(u.host)) return null;
    pathname = u.pathname;
  } else if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    pathname = value.startsWith("/") ? value : "/" + value;
  } else {
    return null;
  }

  const rest = decodeURIComponent(pathname.slice(pathname.indexOf("/uploads/") + "/uploads/".length));
  const abs = path.resolve(UPLOADS_DIR, rest);
  if (!abs.startsWith(UPLOADS_DIR + path.sep)) return null; // traversal guard

  const dir = path.dirname(rest);
  const folder = dir === "." ? "files" : dir.split("/").join("-");
  return { abs, folder, rest };
}

/* ------------------------------------------------------------
   walk doc, collect [dottedPath, value] for local refs
------------------------------------------------------------ */
function collect(node, prefix, out) {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    if (parseLocalRef(node)) out.push([prefix, node]);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, prefix ? `${prefix}.${i}` : String(i), out));
    return;
  }
  if (node instanceof Date || node._bsontype) return; // ObjectId, Decimal128...
  if (typeof node === "object") {
    Object.entries(node).forEach(([k, v]) => collect(v, prefix ? `${prefix}.${k}` : k, out));
  }
}

/* ------------------------------------------------------------
   upload (cached per file) 
------------------------------------------------------------ */
const cache = new Map(); // abs path -> Promise<newUrl|null>
const { uploadFileCloud } = require("../utils/imgCloud");

function migrateFile(ref) {
  if (cache.has(ref.abs)) { stats.reused++; return cache.get(ref.abs); }

  const p = (async () => {
    if (!fs.existsSync(ref.abs)) {
      stats.missing++;
      failures.push({ file: ref.rest, error: "local file missing" });
      return null;
    }
    if (DRY) return "DRY_RUN_URL";
    try {
      const ext = path.extname(ref.abs).toLowerCase();
      const out = await uploadFileCloud(ref.abs, ref.folder, {
        filename: path.basename(ref.abs),
        mimetype: MIME[ext],
      });
      stats.uploaded++;
      return out.url;
    } catch (e) {
      stats.failed++;
      failures.push({ file: ref.rest, error: e.message });
      return null;
    }
  })();

  cache.set(ref.abs, p);
  return p;
}

/* small promise pool */
async function pool(items, worker, size) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        await worker(items[idx]);
      }
    })
  );
}

/* ------------------------------------------------------------
   load every model file so we know all collections
------------------------------------------------------------ */
function loadModels() {
  const dir = path.join(ROOT, "models");
  fs.readdirSync(dir).filter((f) => f.endsWith(".js")).forEach((f) => require(path.join(dir, f)));
  return Object.values(mongoose.models).filter((m) => m.modelName !== "CloudFile");
}

async function migrateCollection(Model) {
  const col = Model.collection;
  const cursor = col.find({});
  let touched = 0;

  for await (const doc of cursor) {
    stats.docs++;
    const refs = [];
    collect(doc, "", refs);
    if (!refs.length) continue;
    stats.refs += refs.length;

    const set = {};
    const localToDelete = [];

    await pool(
      refs,
      async ([dotted, value]) => {
        const ref = parseLocalRef(value);
        const newUrl = await migrateFile(ref);
        if (newUrl) {
          set[dotted] = newUrl;
          localToDelete.push(ref.abs);
        }
      },
      CONCURRENCY
    );

    if (!Object.keys(set).length) continue;
    touched++;

    if (!DRY) {
      await col.updateOne({ _id: doc._id }, { $set: set });
      stats.docsUpdated++;
      if (DELETE_LOCAL) {
        [...new Set(localToDelete)].forEach((f) => fs.unlink(f, () => { }));
      }
    }
    console.log(`  ${DRY ? "[dry] " : ""}${Model.modelName} ${doc._id}: ${Object.keys(set).length} field(s)`);
  }
  return touched;
}

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
  console.log(`Mode: ${DRY ? "DRY RUN" : "LIVE"} | uploads: ${UPLOADS_DIR} | concurrency: ${CONCURRENCY}`);
  console.log(`Treating hosts as local: ${[...OUR_HOSTS].join(", ")}`);

  await mongoose.connect(process.env.MONGO_URI);
  const models = loadModels();

  for (const Model of models) {
    console.log(`\n→ ${Model.modelName} (${Model.collection.name})`);
    await migrateCollection(Model);
  }

  console.log("\n================ SUMMARY ================");
  console.log(stats);
  if (failures.length) {
    const report = path.join(ROOT, `imgcloud-migration-failures-${Date.now()}.json`);
    fs.writeFileSync(report, JSON.stringify(failures, null, 2));
    console.log(`Failures: ${failures.length} → ${report}`);
  }
  await mongoose.disconnect();
  process.exit(failures.length ? 1 : 0);
})().catch((e) => {
  console.error("Migration crashed:", e);
  process.exit(1);
});
