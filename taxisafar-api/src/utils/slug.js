const slugify = require("slugify");

const toSlug = (str) => slugify(String(str || ""), { lower: true, strict: true, trim: true });

async function uniqueSlug(Model, value, ignoreId = null) {
  const base = toSlug(value) || "item";
  let slug = base;
  let i = 1;
  for (;;) {
    const q = { slug };
    if (ignoreId) q._id = { $ne: ignoreId };
    if (!(await Model.exists(q))) return slug;
    slug = `${base}-${++i}`;
  }
}

module.exports = { toSlug, uniqueSlug };
