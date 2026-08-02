const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { ok, created, paginate, pageMeta } = require("../utils/response");
const { uniqueSlug } = require("../utils/slug");

/**
 * Keys the server owns. If a client echoes a fetched record straight back —
 * which every edit form does — these must not be written over the document.
 * `startingPrice` is a virtual with no setter, `id` is not a real path.
 */
const SERVER_OWNED = new Set([
  "_id", "id", "__v", "createdAt", "updatedAt", "createdBy", "startingPrice",
]);

const sanitizePayload = (body = {}) => {
  const out = {};
  for (const [key, value] of Object.entries(body)) {
    if (SERVER_OWNED.has(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
};

/**
 * Mixed paths (`Content.sections[].items`, `.data`) are opaque to Mongoose's
 * change tracking — assigning to them does not mark the document dirty, so the
 * write is silently dropped on save. Flag them explicitly.
 */
const markMixedPaths = (doc, payload) => {
  doc.schema.eachPath((pathName, schemaType) => {
    const root = pathName.split(".")[0];
    if (!(root in payload)) return;
    if (schemaType.instance === "Mixed" || schemaType.constructor.name === "SchemaTypeMixed") {
      doc.markModified(root);
    }
  });

  // arrays of subdocuments that themselves contain Mixed members
  for (const key of Object.keys(payload)) {
    const schemaType = doc.schema.path(key);
    if (schemaType && schemaType.$isMongooseDocumentArray) doc.markModified(key);
  }
};

/**
 * Small CRUD factory. Every resource controller in this project is a thin
 * wrapper around it, so listing/pagination/search behave identically everywhere.
 */
function crud(Model, options = {}) {
  const {
    searchFields = ["name"],
    populate = "",
    sort = { sortOrder: 1, createdAt: -1 },
    slugFrom = null,
    defaultFilter = {},
    transform = (doc) => doc,
  } = options;

  const buildFilter = (query) => {
    const filter = { ...defaultFilter };

    if (query.search && searchFields.length) {
      const rx = new RegExp(String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true" || query.isActive === true;

    for (const [k, v] of Object.entries(query.filter || {})) filter[k] = v;
    return filter;
  };

  return {
    list: asyncHandler(async (req, res) => {
      const { page, limit, skip } = paginate(req.query);
      const filter = buildFilter(req.query);

      const [items, total] = await Promise.all([
        Model.find(filter).populate(populate).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }),
        Model.countDocuments(filter),
      ]);

      return ok(res, items.map(transform), "Fetched successfully", pageMeta(total, page, limit));
    }),

    getOne: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
      const doc = await Model.findOne(query).populate(populate).lean({ virtuals: true });
      if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
      return ok(res, transform(doc), "Fetched successfully");
    }),

    create: asyncHandler(async (req, res) => {
      const payload = { ...sanitizePayload(req.body), createdBy: req.user?.id || null };
      if (slugFrom && !payload.slug) payload.slug = await uniqueSlug(Model, payload[slugFrom]);
      const doc = await Model.create(payload);
      return created(res, doc.toJSON(), `${Model.modelName} created successfully`);
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);

      const payload = sanitizePayload(req.body);
      console.log("update payload:", payload);
      payload.updatedBy = req.user?.id || null;

      if (slugFrom && payload[slugFrom] && payload[slugFrom] !== doc[slugFrom]) {
        payload.slug = await uniqueSlug(Model, payload[slugFrom], doc._id);
      }

      // `set` casts nested paths and document arrays properly; plain
      // Object.assign leaves subdocument arrays only partially applied.
      doc.set(payload);
      markMixedPaths(doc, payload);

      await doc.save();
      return ok(res, doc.toJSON(), `${Model.modelName} updated successfully`);
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
      return ok(res, null, `${Model.modelName} deleted successfully`);
    }),
  };
}

module.exports = crud;
module.exports.sanitizePayload = sanitizePayload;