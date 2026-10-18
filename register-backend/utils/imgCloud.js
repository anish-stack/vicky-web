"use strict";

const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const path = require("path");
const CloudFile = require("../models/CloudFile");
const IMGCLOUD_BASE = process.env.IMGCLOUD_BASE_URL;
const IMGCLOUD_KEY =
  process.env.IMGCLOUD_API_KEY ||
  (() => {
    throw new Error("IMGCLOUD_API_KEY is not set");
  })();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/* ==================================================
   Helpers
================================================== */

function isRetryableError(err) {
  if (!err.response) return true;
  return err.response.status >= 500;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomAltText(folder = "image") {
  const words = [
    "premium",
    "modern",
    "clean",
    "high quality",
    "professional",
    "optimized",
    "beautiful",
    "creative",
  ];

  const pick = words[Math.floor(Math.random() * words.length)];

  return `${pick} ${folder} image`;
}

/* ==================================================
   Upload Single Image
================================================== */

const uploadSingleImagCloud = async (
  fileInput,
  folder = "files",
  opts = {},
  retryCount = 0
) => {
  try {
    const form = new FormData();

    /* ----------------------------------------------
       File Input
    ---------------------------------------------- */
    if (Buffer.isBuffer(fileInput)) {
      const filename = `upload_${Date.now()}.jpg`;

      form.append("file", fileInput, {
        filename,
        contentType: "application/octet-stream",
      });
    } else if (typeof fileInput === "string") {
      await fs.promises.access(fileInput);

      form.append("file", fs.createReadStream(fileInput));
    } else {
      throw new Error("fileInput must be Buffer or file path");
    }

    /* ----------------------------------------------
       Always Public
    ---------------------------------------------- */
    form.append("is_public", "true");

    /* ----------------------------------------------
       Folder
    ---------------------------------------------- */
    form.append("folder", folder);

    /* ----------------------------------------------
       Tags
    ---------------------------------------------- */
    if (opts.tags) {
      form.append(
        "tags",
        Array.isArray(opts.tags)
          ? JSON.stringify(opts.tags)
          : opts.tags
      );
    }

    /* ----------------------------------------------
       Alt Text
       If not provided => random alt
    ---------------------------------------------- */
    const finalAlt =
      opts.alt_text &&
      String(opts.alt_text).trim().length > 0
        ? String(opts.alt_text).trim()
        : randomAltText(folder);

    form.append("alt_text", finalAlt);

    /* ----------------------------------------------
       Upload API
    ---------------------------------------------- */
    const response = await axios.post(
      `${IMGCLOUD_BASE}/api/images/upload`,
      form,
      {
        headers: {
          "X-Api-Key": IMGCLOUD_KEY,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );

    const img = response.data.data.image;

    return {
      url: img.url,
      image: img.url,
      id: img.id,
      public_id: img.id,
      user_id: img.user_id,
      original_name: img.original_name,
      file_size: img.file_size,
      mime_type: img.mime_type,
      width: img.width,
      height: img.height,
      format: img.format,
      folder: img.folder,
      tags: img.tags,
      alt_text: img.alt_text,
      is_public: img.is_public,
      created_at: img.created_at,
    };
  } catch (err) {
    const status = err.response?.status;
    const message =
      err.response?.data?.message || err.message;

    console.error(
      `[ImgCloud] Upload failed (attempt ${
        retryCount + 1
      }): ${
        status ? `HTTP ${status} — ` : ""
      }${message}`
    );

    /* ----------------------------------------------
       Retry
    ---------------------------------------------- */
    if (
      retryCount < MAX_RETRIES &&
      isRetryableError(err)
    ) {
      await sleep(
        RETRY_DELAY * Math.pow(2, retryCount)
      );

      return uploadSingleImagCloud(
        fileInput,
        folder,
        opts,
        retryCount + 1
      );
    }

    throw new Error(
      `[ImgCloud] Upload failed after ${
        retryCount + 1
      } attempt(s): ${message}`
    );
  }
};

/* ==================================================
   Upload Single PDF
================================================== */
const uploadSinglePdfCloud = async (
  fileInput,
  folder = "files",
  opts = {},
  retryCount = 0
) => {
  try {
    console.log("\n==================================================");
    console.log("🚀 [ImgCloud] Starting PDF Upload");
    console.log("==================================================");

    console.log("📁 Folder:", folder);
    console.log("📄 Input Type:", typeof fileInput);
    console.log("📦 Is Buffer:", Buffer.isBuffer(fileInput));
    console.log("🔄 Attempt:", `${retryCount + 1}/${MAX_RETRIES + 1}`);
    console.log("🌐 Base URL:", IMGCLOUD_BASE);
    console.log(
      "🔑 API Key Present:",
      Boolean(IMGCLOUD_KEY)
    );
    console.log("🏷️ Options:", opts);

    const form = new FormData();

    /* ----------------------------------------------
       File Input
    ---------------------------------------------- */

    if (Buffer.isBuffer(fileInput)) {
      const filename = `upload_${Date.now()}.pdf`;

      console.log("📦 Uploading PDF from Buffer");
      console.log("📄 Generated Filename:", filename);
      console.log("📊 Buffer Size:", fileInput.length);

      form.append("file", fileInput, {
        filename,
        contentType: "application/pdf",
      });
    } else if (typeof fileInput === "string") {
      console.log("📂 Uploading PDF from File Path");
      console.log("📍 File Path:", fileInput);

      await fs.promises.access(fileInput);

      console.log("✅ File exists");

      if (!fileInput.toLowerCase().endsWith(".pdf")) {
        console.error(
          "❌ Invalid file extension:",
          fileInput
        );

        throw new Error(
          "fileInput must be a .pdf file"
        );
      }

      const stats = await fs.promises.stat(fileInput);

      console.log("📊 File Size:", stats.size);
      console.log("📄 Extension:", ".pdf");

      form.append(
        "file",
        fs.createReadStream(fileInput),
        {
          filename: path.basename(fileInput),
          contentType: "application/pdf",
        }
      );
    } else {
      console.error(
        "❌ Invalid fileInput type:",
        typeof fileInput
      );

      throw new Error(
        "fileInput must be Buffer or file path"
      );
    }

    /* ----------------------------------------------
       Always Public
    ---------------------------------------------- */

    form.append("is_public", "true");

    console.log("🌍 is_public:", "true");

    /* ----------------------------------------------
       Folder
    ---------------------------------------------- */

    form.append("folder", folder);

    console.log("📁 folder:", folder);

    /* ----------------------------------------------
       Tags
    ---------------------------------------------- */

    if (opts.tags) {
      const tagsValue = Array.isArray(opts.tags)
        ? JSON.stringify(opts.tags)
        : opts.tags;

      form.append("tags", tagsValue);

      console.log("🏷️ tags:", tagsValue);
    } else {
      console.log("🏷️ tags: Not provided");
    }

    /* ----------------------------------------------
       Alt Text
    ---------------------------------------------- */

    const finalAlt =
      opts.alt_text &&
      String(opts.alt_text).trim().length > 0
        ? String(opts.alt_text).trim()
        : randomAltText(folder);

    form.append("alt_text", finalAlt);

    console.log("📝 alt_text:", finalAlt);

    /* ----------------------------------------------
       Form Headers
    ---------------------------------------------- */

    const formHeaders = form.getHeaders();

    console.log(
      "📨 Form Headers:",
      JSON.stringify(formHeaders, null, 2)
    );

    /* ----------------------------------------------
       Upload API
    ---------------------------------------------- */

    const uploadUrl =
      `${IMGCLOUD_BASE}/api/images/upload`;

    console.log("\n🚀 Sending Upload Request...");
    console.log("🌐 URL:", uploadUrl);
    console.log("⏱️ Timeout:", "60000ms");

    const response = await axios.post(
      uploadUrl,
      form,
      {
        headers: {
          "X-Api-Key": IMGCLOUD_KEY,
          ...formHeaders,
        },

        maxBodyLength: Infinity,
        maxContentLength: Infinity,

        timeout: 60000,
      }
    );

    /* ----------------------------------------------
       Response Debug
    ---------------------------------------------- */

    console.log("\n==================================================");
    console.log("✅ [ImgCloud] Upload Successful");
    console.log("==================================================");

    console.log("📊 HTTP Status:", response.status);
    console.log(
      "📨 Response:",
      JSON.stringify(
        response.data,
        null,
        2
      )
    );

    /* ----------------------------------------------
       Extract File
    ---------------------------------------------- */

    const file =
      response.data?.data?.image;

    if (!file) {
      console.error(
        "❌ Upload succeeded but image/file data missing"
      );

      console.error(
        "❌ Full Response:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      throw new Error(
        "ImgCloud response does not contain data.image"
      );
    }

    console.log("📄 Uploaded File:");
    console.log("   ID:", file.id);
    console.log("   URL:", file.url);
    console.log(
      "   Original Name:",
      file.original_name
    );
    console.log(
      "   File Size:",
      file.file_size
    );
    console.log(
      "   MIME Type:",
      file.mime_type
    );

    /* ----------------------------------------------
       Return
    ---------------------------------------------- */

    return {
      url: file.url,
      image: file.url,

      id: file.id,
      public_id: file.id,

      user_id: file.user_id,

      original_name: file.original_name,
      file_size: file.file_size,
      mime_type: file.mime_type,

      folder: file.folder,
      tags: file.tags,
      alt_text: file.alt_text,

      is_public: file.is_public,

      created_at: file.created_at,
    };
  } catch (err) {
    /* ----------------------------------------------
       Error Information
    ---------------------------------------------- */

    const status =
      err.response?.status;

    const responseData =
      err.response?.data;

    const message =
      responseData?.message ||
      responseData?.error ||
      err.message ||
      "Unknown error";

    console.error("\n");
    console.error(
      "=========================================================="
    );
    console.error(
      "❌❌❌ [ImgCloud] PDF UPLOAD FAILED ❌❌❌"
    );
    console.error(
      "=========================================================="
    );

    console.error(
      "🔄 Attempt:",
      `${retryCount + 1}/${MAX_RETRIES + 1}`
    );

    console.error(
      "❌ Error Message:",
      err.message
    );

    console.error(
      "❌ Error Code:",
      err.code
    );

    console.error(
      "❌ Error Name:",
      err.name
    );

    console.error(
      "❌ HTTP Status:",
      status || "No HTTP response"
    );

    console.error(
      "❌ Request URL:",
      err.config?.url
    );

    console.error(
      "❌ Request Method:",
      err.config?.method
    );

    /* ----------------------------------------------
       Response Data
    ---------------------------------------------- */

    console.error(
      "\n📨 API Response Data:"
    );

    if (responseData) {
      console.error(
        JSON.stringify(
          responseData,
          null,
          2
        )
      );
    } else {
      console.error(
        "No response received from ImgCloud"
      );
    }

    /* ----------------------------------------------
       Response Headers
    ---------------------------------------------- */

    console.error(
      "\n📨 API Response Headers:"
    );

    if (err.response?.headers) {
      console.error(
        JSON.stringify(
          err.response.headers,
          null,
          2
        )
      );
    } else {
      console.error(
        "No response headers"
      );
    }

    /* ----------------------------------------------
       Request Headers
    ---------------------------------------------- */

    console.error(
      "\n📤 Request Headers:"
    );

    if (err.config?.headers) {
      const safeHeaders = {
        ...err.config.headers,

        "X-Api-Key":
          err.config.headers[
            "X-Api-Key"
          ]
            ? "***HIDDEN***"
            : undefined,

        "x-api-key":
          err.config.headers[
            "x-api-key"
          ]
            ? "***HIDDEN***"
            : undefined,
      };

      console.error(
        JSON.stringify(
          safeHeaders,
          null,
          2
        )
      );
    }

    /* ----------------------------------------------
       Request Details
    ---------------------------------------------- */

    console.error(
      "\n📄 Upload Details:"
    );

    console.error(
      "   Folder:",
      folder
    );

    console.error(
      "   Input Type:",
      typeof fileInput
    );

    console.error(
      "   Is Buffer:",
      Buffer.isBuffer(fileInput)
    );

    console.error(
      "   Options:",
      JSON.stringify(
        opts,
        null,
        2
      )
    );

    console.error(
      "   API Key Present:",
      Boolean(IMGCLOUD_KEY)
    );

    console.error(
      "   Base URL:",
      IMGCLOUD_BASE
    );

    /* ----------------------------------------------
       Network Error Detection
    ---------------------------------------------- */

    if (err.code === "ECONNABORTED") {
      console.error(
        "\n⏱️ ERROR TYPE: Request Timeout"
      );

      console.error(
        "ImgCloud API did not respond within 60 seconds."
      );
    }

    if (err.code === "ECONNREFUSED") {
      console.error(
        "\n🚫 ERROR TYPE: Connection Refused"
      );

      console.error(
        "ImgCloud server/host refused the connection."
      );
    }

    if (err.code === "ENOTFOUND") {
      console.error(
        "\n🌐 ERROR TYPE: DNS Error"
      );

      console.error(
        "Could not resolve ImgCloud hostname."
      );
    }

    if (
      !err.response &&
      err.request
    ) {
      console.error(
        "\n📡 ERROR TYPE: No Response"
      );

      console.error(
        "Request was sent but server did not return a response."
      );
    }

    /* ----------------------------------------------
       Stack Trace
    ---------------------------------------------- */

    console.error(
      "\n🧵 Stack Trace:"
    );

    console.error(
      err.stack
    );

    console.error(
      "=========================================================="
    );

    /* ----------------------------------------------
       Retry
    ---------------------------------------------- */

    const shouldRetry =
      retryCount < MAX_RETRIES &&
      isRetryableError(err);

    console.error(
      "\n🔁 Should Retry:",
      shouldRetry
    );

    if (shouldRetry) {
      const delay =
        RETRY_DELAY *
        Math.pow(
          2,
          retryCount
        );

      console.log(
        `\n⏳ [ImgCloud] Retrying PDF upload in ${delay}ms...`
      );

      console.log(
        `🔁 Next Attempt: ${
          retryCount + 2
        }/${MAX_RETRIES + 1}`
      );

      await sleep(delay);

      return uploadSinglePdfCloud(
        fileInput,
        folder,
        opts,
        retryCount + 1
      );
    }

    /* ----------------------------------------------
       Final Error
    ---------------------------------------------- */

    console.error(
      "\n💥 [ImgCloud] FINAL FAILURE"
    );

    console.error(
      `PDF upload failed after ${
        retryCount + 1
      } attempt(s)`
    );

    throw new Error(
      `[ImgCloud] PDF upload failed after ${
        retryCount + 1
      } attempt(s): ${message}`
    );
  }
};

/* ==================================================
   Delete Image
================================================== */

const deleteImageCloudImage = async (imageId, retryCount = 0) => {
  try {
    if (!imageId) {
      throw new Error("imageId is required for deletion");
    }

    const response = await axios.delete(
      `${IMGCLOUD_BASE}/api/images/${imageId}`,
      {
        headers: {
          "X-Api-Key": IMGCLOUD_KEY,
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      message: response.data?.message || "Image deleted successfully",
      data: response.data?.data || null,
    };
  } catch (err) {
    const status = err.response?.status;
    const message =
      err.response?.data?.message || err.message;

    console.error(
      `[ImgCloud] Delete failed (attempt ${retryCount + 1}): ${
        status ? `HTTP ${status} — ` : ""
      }${message}`
    );

    /* ----------------------------------------------
       Retry logic
    ---------------------------------------------- */
    if (
      retryCount < MAX_RETRIES &&
      isRetryableError(err)
    ) {
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));

      return deleteImageCloudImage(imageId, retryCount + 1);
    }

    throw new Error(
      `[ImgCloud] Delete failed after ${
        retryCount + 1
      } attempt(s): ${message}`
    );
  }
};

/* ==================================================
   Generic upload (keeps original filename + mimetype)
   Works for any file type: image / pdf / audio
================================================== */

const uploadFileCloud = async (
  fileInput,
  folder = "files",
  meta = {},
  retryCount = 0
) => {
  try {
    const form = new FormData();

    if (Buffer.isBuffer(fileInput)) {
      form.append("file", fileInput, {
        filename: meta.filename || `upload_${Date.now()}`,
        contentType: meta.mimetype || "application/octet-stream",
      });
    } else if (typeof fileInput === "string") {
      await fs.promises.access(fileInput);
      form.append("file", fs.createReadStream(fileInput), {
        filename: meta.filename || path.basename(fileInput),
        ...(meta.mimetype ? { contentType: meta.mimetype } : {}),
      });
    } else {
      throw new Error("fileInput must be Buffer or file path");
    }

    form.append("is_public", "true");
    form.append("folder", folder);
    if (meta.tags) {
      form.append(
        "tags",
        Array.isArray(meta.tags) ? JSON.stringify(meta.tags) : meta.tags
      );
    }
    form.append(
      "alt_text",
      meta.alt_text && String(meta.alt_text).trim()
        ? String(meta.alt_text).trim()
        : randomAltText(folder)
    );

    const response = await axios.post(
      `${IMGCLOUD_BASE}/api/images/upload`,
      form,
      {
        headers: { "X-Api-Key": IMGCLOUD_KEY, ...form.getHeaders() },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000,
      }
    );

    const img = response.data?.data?.image;
    if (!img) throw new Error("ImgCloud response does not contain data.image");

    // remember url -> id so we can delete later by url
    try {
      await CloudFile.updateOne(
        { url: img.url },
        { $set: { url: img.url, cloudId: String(img.id), folder } },
        { upsert: true }
      );
    } catch (e) {
      console.error("[ImgCloud] CloudFile map save failed:", e.message);
    }

    return {
      url: img.url,
      image: img.url,
      id: img.id,
      public_id: img.id,
      original_name: img.original_name,
      file_size: img.file_size,
      mime_type: img.mime_type,
      folder: img.folder,
    };
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    console.error(
      `[ImgCloud] Upload failed (attempt ${retryCount + 1}): ${
        status ? `HTTP ${status} — ` : ""
      }${message}`
    );
    if (retryCount < MAX_RETRIES && isRetryableError(err)) {
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return uploadFileCloud(fileInput, folder, meta, retryCount + 1);
    }
    throw new Error(
      `[ImgCloud] Upload failed after ${retryCount + 1} attempt(s): ${message}`
    );
  }
};

/* ==================================================
   Delete by URL (lookup id in CloudFile, fallback: parse url)
   Never throws. Local /uploads/... urls are ignored.
================================================== */


const guessIdFromUrl = (url) => {
  const m =
    url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i) ||
    url.match(/\/images?\/([A-Za-z0-9_-]+)(?:[/?#.]|$)/);
  return m ? m[1] || m[0] : null;
};

const deleteImageByUrl = async (url) => {
  try {
    if (!url || typeof url !== "string") return false;
    // old local file, nothing in cloud
    if (url.startsWith("/uploads/") || url.includes("/uploads/")) return false;

    const row = await CloudFile.findOne({ url }).lean();
    const id = row?.cloudId || guessIdFromUrl(url);
    if (!id) {
      console.warn("[ImgCloud] delete skipped, id unknown for:", url);
      return false;
    }
    await deleteImageCloudImage(id);
    await CloudFile.deleteOne({ url });
    return true;
  } catch (err) {
    console.error("[ImgCloud] deleteImageByUrl failed:", err.message);
    return false;
  }
};

const deleteImagesByUrls = (urls = []) =>
  Promise.all((urls || []).map((u) => deleteImageByUrl(u)));

module.exports = {
  uploadSingleImagCloud,
  uploadSinglePdfCloud,
  uploadFileCloud,
  deleteImageCloudImage,
  deleteImageByUrl,
  deleteImagesByUrls,
};
