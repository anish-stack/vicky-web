"use strict";

const multer = require("multer");
const { uploadFileCloud, deleteImageByUrl } = require("../utils/imgCloud");

/* ===============================
   multer memory instance (no disk)
================================*/
const memoryUpload = ({ fileSize = 5 * 1024 * 1024, fileFilter, files } = {}) =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize, ...(files ? { files } : {}) },
  });

/* ===============================
   collect every file from req
   (req.file / req.files array / req.files object)
================================*/
const collectFiles = (req) => {
  const list = [];
  if (req.file) list.push(req.file);
  if (Array.isArray(req.files)) list.push(...req.files);
  else if (req.files && typeof req.files === "object") {
    Object.values(req.files).forEach((arr) => list.push(...arr));
  }
  return list;
};

/* ===============================
   Delete already-uploaded cloud files of this req
   (call on validation error / rollback)
================================*/
const cleanupCloudFiles = (reqFiles = {}) => {
  const arr = Array.isArray(reqFiles) ? reqFiles : Object.values(reqFiles).flat();
  return Promise.all(arr.map((f) => (f && f.url ? deleteImageByUrl(f.url) : null)));
};

/* ===============================
   Middleware: push memory files to ImgCloud.
   After this, for every file:
     file.url / file.cloudId set
     file.filename = file.url   (old code that used filename keeps working)
     file.buffer freed
   folderFor(file) -> ImgCloud folder name
================================*/
const pushToImgCloud = (folderFor) => async (req, res, next) => {
  const files = collectFiles(req);
  if (!files.length) return next();

  try {
    await Promise.all(
      files.map(async (file) => {
        const folder =
          typeof folderFor === "function" ? folderFor(file) : folderFor || "files";

        const out = await uploadFileCloud(file.buffer, folder, {
          filename: file.originalname,
          mimetype: file.mimetype,
        });

        file.url = out.url;
        file.cloudId = out.id;
        file.filename = out.url;
        file.buffer = undefined;
      })
    );
    next();
  } catch (err) {
    // rollback the ones that made it
    await cleanupCloudFiles(files.filter((f) => f.url));
    next(err);
  }
};

/* ===============================
   multer + cloud push in one array
   (express accepts arrays as middleware)
================================*/
const withImgCloud = (multerMw, folderFor) => [multerMw, pushToImgCloud(folderFor)];

module.exports = {
  memoryUpload,
  pushToImgCloud,
  withImgCloud,
  cleanupCloudFiles,
  collectFiles,
};
