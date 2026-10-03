/**
 * Browser-side image preparation for tour uploads.
 *
 * - centre-crops to the required ratio (so a wrong-shaped photo can never be saved)
 * - downsizes to the target pixel size (big phone photos become ~150-500 KB)
 * - re-encodes as WebP (JPEG fallback), so uploads stay small and never hit the
 *   server / nginx body-size limit that used to show "Cannot reach the API server".
 */

/** Required size/ratio for every image slot in the tour form. */
export const IMG_SPECS = {
  cover: { w: 1600, h: 1000, ratio: "16:10", use: "Cover / main photo" },
  gallery: { w: 1600, h: 1000, ratio: "16:10", use: "Gallery photo" },
  day: { w: 1200, h: 900, ratio: "4:3", use: "Itinerary day photo" },
  place: { w: 800, h: 600, ratio: "4:3", use: "Place photo" },
  vehicle: { w: 900, h: 600, ratio: "3:2", use: "Vehicle photo (transparent PNG/WebP best)" },
  hotel: { w: 1200, h: 900, ratio: "4:3", use: "Hotel photo" },
};

export const specText = (spec) => `${spec.w} × ${spec.h} px · Ratio ${spec.ratio}`;

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name}: could not read this image`));
    };
    img.src = url;
  });

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

const MAX_BYTES = 1.5 * 1024 * 1024;

/**
 * @returns {Promise<{file: File, cropped: boolean, from: string, to: string}>}
 * Throws an Error with a user-friendly message when the image is unusable.
 */
export async function prepareImage(file, spec) {
  const img = await readImage(file);
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;

  // too small to look sharp at the required size
  const minW = Math.round(spec.w * 0.5);
  if (sw < minW) {
    throw new Error(`${file.name}: image is too small (${sw}×${sh}). Minimum width for this slot is ${minW}px, recommended ${spec.w}×${spec.h}.`);
  }

  const target = spec.w / spec.h;
  const current = sw / sh;

  // centre crop to the required ratio
  let cw = sw;
  let ch = sh;
  if (Math.abs(current - target) > 0.01) {
    if (current > target) cw = Math.round(sh * target);
    else ch = Math.round(sw / target);
  }
  const sx = Math.round((sw - cw) / 2);
  const sy = Math.round((sh - ch) / 2);
  const cropped = cw !== sw || ch !== sh;

  // never upscale
  const scale = Math.min(1, spec.w / cw);
  const ow = Math.max(1, Math.round(cw * scale));
  const oh = Math.max(1, Math.round(ch * scale));

  const canvas = document.createElement("canvas");
  canvas.width = ow;
  canvas.height = oh;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, ow, oh);

  let type = "image/webp";
  let quality = 0.86;
  let blob = await toBlob(canvas, type, quality);
  if (!blob || blob.type !== "image/webp") {
    type = "image/jpeg";
    blob = await toBlob(canvas, type, quality);
  }
  while (blob && blob.size > MAX_BYTES && quality > 0.5) {
    quality -= 0.1;
    // eslint-disable-next-line no-await-in-loop
    blob = await toBlob(canvas, type, quality);
  }
  if (!blob) throw new Error(`${file.name}: could not process this image`);

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "image";
  return {
    file: new File([blob], `${base}.${ext}`, { type: blob.type, lastModified: Date.now() }),
    cropped,
    from: `${sw}×${sh}`,
    to: `${ow}×${oh}`,
  };
}
